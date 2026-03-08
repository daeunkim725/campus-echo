import re

with open("src/api/apiClient.js", "r") as f:
    content = f.read()

# Fix the error property assignments
original = """    if (!response.ok) {
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }"""

fixed = """    if (!response.ok) {
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        /** @type {any} */ (error).status = response.status;
        /** @type {any} */ (error).data = data;
        throw error;
    }"""

content = content.replace(original, fixed)

with open("src/api/apiClient.js", "w") as f:
    f.write(content)
