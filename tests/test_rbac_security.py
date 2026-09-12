import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import HTTPException
from app import (
    execute_dispatch, 
    dispatch_battery, 
    charge_battery, 
    discharge_battery,
    DispatchRequest, 
    BatteryDispatchRequest,
    verify_dispatch_role
)

def test_dispatch_execute_authorized_dispatcher():
    """Chief Grid Dispatcher should be permitted to execute physical grid dispatch."""
    req = DispatchRequest(
        action_type="SPINNING_RESERVE_RAMP",
        magnitude_mw=50.0,
        target_facility="Dhuvaran CCPP Peaker",
        operator_name="Krish Patel",
        operator_role="chief_grid_dispatcher",
        rationale="Compensating evening solar cliff"
    )
    res = execute_dispatch(req, x_user_role=None)
    assert res["status"] == "success", f"Expected success, got {res}"
    assert "SPINNING_RESERVE_RAMP" in res["message"]
    print("✓ test_dispatch_execute_authorized_dispatcher passed (200 OK)")

def test_dispatch_execute_forbidden_for_trading_analyst():
    """Energy Trading Analyst must be blocked with HTTP 403 Forbidden."""
    req = DispatchRequest(
        action_type="SPINNING_RESERVE_RAMP",
        magnitude_mw=50.0,
        target_facility="Dhuvaran CCPP Peaker",
        operator_name="Aditi Sharma",
        operator_role="energy_trading_analyst",
        rationale="Commercial speculation"
    )
    try:
        execute_dispatch(req, x_user_role=None)
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403, f"Expected 403, got {e.status_code}"
        assert "403 Forbidden" in e.detail
        print("✓ test_dispatch_execute_forbidden_for_trading_analyst passed (HTTP 403 Forbidden confirmed)")

def test_dispatch_execute_forbidden_for_plant_engineer():
    """Plant Operations Engineer must be blocked with HTTP 403 Forbidden."""
    req = DispatchRequest(
        action_type="GRID_PEAKER_RAMP",
        magnitude_mw=30.0,
        target_facility="Sanand Substation",
        operator_name="Rajesh Kumar",
        operator_role="plant_operations_engineer",
        rationale="Testing grid control"
    )
    try:
        execute_dispatch(req, x_user_role=None)
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403, f"Expected 403, got {e.status_code}"
        print("✓ test_dispatch_execute_forbidden_for_plant_engineer passed (HTTP 403 Forbidden confirmed)")

def test_dispatch_execute_forbidden_for_remc_officer():
    """REMC Desk Officer must be blocked with HTTP 403 Forbidden for physical dispatch."""
    req = DispatchRequest(
        action_type="GRID_PEAKER_RAMP",
        magnitude_mw=25.0,
        target_facility="Gujarat SLDC",
        operator_name="Vikram Sethi",
        operator_role="remc_desk_officer",
        rationale="REMC coordination"
    )
    try:
        execute_dispatch(req, x_user_role=None)
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403, f"Expected 403, got {e.status_code}"
        print("✓ test_dispatch_execute_forbidden_for_remc_officer passed (HTTP 403 Forbidden confirmed)")

def test_dispatch_via_header_rbac():
    """Header-based role identification must also enforce RBAC."""
    req = DispatchRequest(
        action_type="BESS_DISCHARGE",
        magnitude_mw=20.0,
        target_facility="Sanand BESS",
        operator_name="Krish Patel"
    )
    # With Dispatcher header -> Success
    res_ok = execute_dispatch(req, x_user_role="chief_grid_dispatcher")
    assert res_ok["status"] == "success"

    # With Trading Analyst header -> 403 Forbidden
    try:
        execute_dispatch(req, x_user_role="energy_trading_analyst")
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403
        print("✓ test_dispatch_via_header_rbac passed (Header X-User-Role 403 verified)")

def test_battery_dispatch_rbac():
    """Battery physical control endpoint must enforce 403 for unauthorized roles."""
    # Authorized dispatcher
    req_auth = BatteryDispatchRequest(
        action="DISCHARGE",
        power_mw=15.0,
        mode="PEAK_SHAVING",
        user_role="chief_grid_dispatcher",
        station="Sanand BESS 20MW/50MWh"
    )
    res_auth = dispatch_battery(req_auth, x_user_role=None)
    assert res_auth["status"] == "success"

    # Unauthorized trading analyst
    req_unauth = BatteryDispatchRequest(
        action="DISCHARGE",
        power_mw=15.0,
        mode="PEAK_SHAVING",
        user_role="energy_trading_analyst",
        station="Sanand BESS 20MW/50MWh"
    )
    try:
        dispatch_battery(req_unauth, x_user_role=None)
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403
        assert "403 Forbidden" in e.detail
        print("✓ test_battery_dispatch_rbac passed (HTTP 403 Forbidden confirmed for unauthorized roles)")

def test_battery_charge_discharge_aliases():
    """Battery charge/discharge endpoints enforce 403 Forbidden."""
    # Dispatcher permitted
    res_charge = charge_battery(power_mw=10.0, x_user_role="chief_grid_dispatcher")
    assert res_charge["status"] == "success"

    # Trading analyst forbidden
    try:
        charge_battery(power_mw=10.0, x_user_role="energy_trading_analyst")
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403

    # Dispatcher discharge permitted
    res_discharge = discharge_battery(power_mw=15.0, x_user_role="chief_grid_dispatcher")
    assert res_discharge["status"] == "success"

    # Plant engineer discharge forbidden
    try:
        discharge_battery(power_mw=15.0, x_user_role="plant_operations_engineer")
        assert False, "Should have raised HTTPException 403"
    except HTTPException as e:
        assert e.status_code == 403
        print("✓ test_battery_charge_discharge_aliases passed (Charge/Discharge RBAC confirmed)")

if __name__ == "__main__":
    tests = [
        test_dispatch_execute_authorized_dispatcher,
        test_dispatch_execute_forbidden_for_trading_analyst,
        test_dispatch_execute_forbidden_for_plant_engineer,
        test_dispatch_execute_forbidden_for_remc_officer,
        test_dispatch_via_header_rbac,
        test_battery_dispatch_rbac,
        test_battery_charge_discharge_aliases,
    ]
    
    passed = 0
    failed = 0
    print(f"\n========================================================")
    print(f"RUNNING {len(tests)} BACKEND RBAC PERMISSION ENFORCEMENT TESTS")
    print(f"========================================================\n")
    for t in tests:
        try:
            t()
            passed += 1
        except Exception as e:
            print(f"✗ {t.__name__} FAILED: {e}")
            failed += 1

    print(f"\n========================================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED.")
    print(f"========================================================\n")
    if failed > 0:
        sys.exit(1)
