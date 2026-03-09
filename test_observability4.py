from playwright.sync_api import sync_playwright
import time

def test_observability():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Intercept and mock the API calls since we don't have a valid Base44 app backend running
        def handle_route(route):
            if "authMe" in route.request.url:
                 route.fulfill(status=200, json={"user": {"id": "admin_123", "email": "admin@campusecho.app", "role": "admin"}})
            elif "entities" in route.request.url:
                 # Mock list requests
                 route.fulfill(status=200, json=[{"id": 1}, {"id": 2}])
            else:
                 route.continue_()

        page = context.new_page()
        page.route("**/api/functions/**", handle_route)

        page.goto("http://localhost:5173/")
        page.evaluate("""() => {
            const adminUser = {
                id: "admin_123",
                email: "admin@campusecho.app",
                displayName: "Admin",
                role: "admin",
                school: "ETHZ",
                school_verified: true,
                age_verified: true,
                profile_complete: true,
                password_set: true
            };
            localStorage.setItem("campus_echo_user", JSON.stringify(adminUser));
            localStorage.setItem("campus_echo_token", "fake_token");
        }""")

        page.goto("http://localhost:5173/observability")

        # Override the fetchStats call by injecting a global mock
        page.evaluate("""() => {
             window.base44_mock_mode = true;
        }""")

        # Wait until element with text 'Observability Dashboard' appears, proving the page loaded
        page.wait_for_selector("text=Observability Dashboard", timeout=10000)
        time.sleep(1)

        import os
        os.makedirs("/home/jules/verification", exist_ok=True)
        page.screenshot(path="/home/jules/verification/observability_rendered.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    test_observability()
