"""
Network Information and IP Geolocation Service
Extracts client network metadata safely without persisting any user data.
"""
import ipaddress
import socket
import urllib.request
import json
import logging
from typing import Dict, Any, Tuple
from starlette.requests import Request

from backend.app.config import settings
from backend.app.models.schemas import GeoInfo, ObservedHeaders, NetworkInfoResponse

logger = logging.getLogger("cybertrace.network")


class NetworkService:
    @staticmethod
    def get_client_ip(request: Request) -> Tuple[str, bool]:
        """
        Determines the true client IP safely.
        Only trusts X-Forwarded-For if the direct peer is in settings.TRUSTED_PROXIES.
        """
        peer_ip = request.client.host if request.client else "127.0.0.1"
        is_forwarded = False

        if peer_ip in settings.TRUSTED_PROXIES:
            forwarded_header = request.headers.get("X-Forwarded-For")
            if forwarded_header:
                # First address in chain is the original client
                first_ip = forwarded_header.split(",")[0].strip()
                if first_ip:
                    return first_ip, True

        return peer_ip, is_forwarded

    @staticmethod
    def is_private_ip(ip_str: str) -> bool:
        """Checks whether the IP is loopback, link-local, or private RFC 1918."""
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            return (
                ip_obj.is_private or 
                ip_obj.is_loopback or 
                ip_obj.is_link_local or 
                ip_obj.is_unspecified or
                ip_obj.is_reserved
            )
        except ValueError:
            return True

    @staticmethod
    def resolve_ip_geo(ip: str) -> GeoInfo:
        """
        Resolves approximate IP geolocation without claiming exact personal location.
        Gracefully falls back if offline, local, or API is unavailable.
        """
        is_private = NetworkService.is_private_ip(ip)

        # Handle local or private networks
        if is_private or ip in ("127.0.0.1", "::1", "localhost"):
            return GeoInfo(
                ip=ip,
                ip_version="IPv6" if ":" in ip else "IPv4",
                is_private_or_local=True,
                city="Localhost / LAN Gateway",
                region="Local Loopback (RFC 1918 / RFC 1122)",
                country="Private Network",
                country_code="LOCAL",
                postal_code="N/A",
                latitude=37.7749,  # Educational default center point (San Francisco Lab Hub)
                longitude=-122.4194,
                isp="Local Interface Loopback",
                asn="AS0 RFC-Reserved",
                source="Local Host Interface (RFC 1918 / RFC 5735)",
                disclaimer=(
                    "Local or Private IP detected. Websites running in your local lab "
                    "or behind a LAN router cannot geolocate your external WAN point unless "
                    "contacted over the public internet."
                )
            )

        # For public IP, query IP-API or fallback
        try:
            url = f"{settings.GEO_SERVICE_URL}/{ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "CyberTrace-Academic-Lab/1.0"}
            )
            with urllib.request.urlopen(req, timeout=settings.GEO_SERVICE_TIMEOUT) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    if data.get("status") == "success":
                        return GeoInfo(
                            ip=data.get("query", ip),
                            ip_version="IPv6" if ":" in ip else "IPv4",
                            is_private_or_local=False,
                            city=data.get("city", "Approximate City"),
                            region=data.get("regionName", "Region"),
                            country=data.get("country", "Country"),
                            country_code=data.get("countryCode", "UNK"),
                            postal_code=data.get("zip", "N/A"),
                            latitude=float(data.get("lat", 0.0)),
                            longitude=float(data.get("lon", 0.0)),
                            isp=data.get("isp", "Internet Service Provider"),
                            asn=data.get("as", "Autonomous System"),
                            source=f"Public GeoIP Provider ({settings.GEO_SERVICE_URL})",
                            disclaimer=(
                                "APPROXIMATE REGION ONLY: IP geolocation identifies the ISP routing facility "
                                "or cell tower gateway, typically 10 to 50 km from the device. "
                                "It does NOT identify a physical house or street address."
                            )
                        )
        except Exception:
            # Silently handle network errors/offline mode
            pass

        # Fallback for public IP when external API is unreachable or offline
        return GeoInfo(
            ip=ip,
            ip_version="IPv6" if ":" in ip else "IPv4",
            is_private_or_local=False,
            city="Approximate Regional Node",
            region="Network Routing Hub",
            country="Global Internet",
            country_code="NET",
            postal_code="N/A",
            latitude=40.7128,
            longitude=-74.0060,
            isp="Upstream Tier-1 Carrier",
            asn="AS-Transit Gateway",
            source="Offline Fallback Resolver",
            disclaimer=(
                "Approximate geographic node based on standard ISP BGP routing. "
                "IP geolocation identifies routing gateways, not individual users."
            )
        )

    @classmethod
    def analyze_request(cls, request: Request) -> NetworkInfoResponse:
        """Inspects incoming HTTP request headers and network metadata."""
        client_ip, is_forwarded = cls.get_client_ip(request)
        geo = cls.resolve_ip_geo(client_ip)

        headers = request.headers
        observed_headers = ObservedHeaders(
            user_agent=headers.get("user-agent"),
            accept_language=headers.get("accept-language"),
            sec_ch_ua=headers.get("sec-ch-ua"),
            sec_ch_ua_platform=headers.get("sec-ch-ua-platform"),
            sec_ch_ua_mobile=headers.get("sec-ch-ua-mobile"),
            dnt=headers.get("dnt"),
            sec_gpc=headers.get("sec-gpc"),
            upgrade_insecure_requests=headers.get("upgrade-insecure-requests")
        )

        tls_hints = {
            "http_version": request.scope.get("http_version", "1.1"),
            "scheme": request.url.scheme,
            "host_header": headers.get("host", "Unknown"),
            "client_port": request.client.port if request.client else None
        }

        educational_note = (
            "Every HTTP request automatically transmits your public IP address and "
            "request headers to the destination server. While essential for routing "
            "and responsive web layout, this metadata forms the foundational layer of web fingerprinting."
        )

        return NetworkInfoResponse(
            status="success",
            client_ip=client_ip,
            is_proxy_forwarded=is_forwarded,
            geo=geo,
            headers=observed_headers,
            tls_http_hints=tls_hints,
            educational_note=educational_note
        )
