from playwright.sync_api import sync_playwright
import time

def test_observability():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Intercept and mock the API calls
        def handle_route(route):
            if "authMe" in route.request.url:
                 route.fulfill(status=200, json={"user": {"id": "admin_123", "email": "admin@campusecho.app", "role": "admin"}})
            elif "entities" in route.request.url:
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
                school: "ETH",
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

        # Trigger reload of stats
        page.evaluate("""() => {
             const btn = document.querySelector('button');
             if (btn) btn.click();
        }""")

        time.sleep(3)

        import os
        os.makedirs("/home/jules/verification", exist_ok=True)
        page.screenshot(path="/home/jules/verification/observability_final.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    test_observability()
