"""
CyberTrace: Digital Exposure Lab - Test Runner
Executes all unit and integration test suites.
"""
import sys
import unittest

def run_all_tests():
    print("=" * 65)
    print("  CYBERTRACE: DIGITAL EXPOSURE LAB - AUTOMATED TEST SUITE")
    print("=" * 65)
    
    loader = unittest.TestLoader()
    suite = loader.discover("backend/tests", pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 65)
    if result.wasSuccessful():
        print(f"  [SUCCESS] All {result.testsRun} tests passed successfully!")
        print("=" * 65)
        return 0
    else:
        print(f"  [FAILED] {len(result.failures)} failures, {len(result.errors)} errors.")
        print("=" * 65)
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
