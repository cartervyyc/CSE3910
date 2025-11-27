#include <iostream>
#include <array>
#include <memory>
#include <string>
#include "../include/httplib.h"
#include "../include/json.hpp" // nlohmann JSON header

using json = nlohmann::json;

std::string run_python(const std::string &input, const std::string &model)
{
    // Build command
    // std::string cmd = "python3 ../../predict.py \"" + input + "\" \"" + model + "\" 2>&1";
    std::string cmd = "python3 ../../predict.py \"" + input + "\" 2>&1";

    std::array<char, 256> buffer{};
    std::string result;

    std::unique_ptr<FILE, decltype(&pclose)>
        pipe(popen(cmd.c_str(), "r"), pclose);

    if (!pipe)
        return "Error running python";

    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr)
        result += buffer.data();

    return result;
}

int main()
{
    httplib::Server svr;

    // Add simple OPTIONS handler so browsers can preflight CORS requests
    svr.Options("/api/chat", [](const httplib::Request & /*req*/, httplib::Response &res)
                {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204; });

    // Post the API Chat
    svr.Post("/api/chat", [](const httplib::Request &req, httplib::Response &res)
             {
        try {
            // 1. Parse JSON request body
            if (req.body.empty()) {
                res.status = 400;
                res.set_content(R"({"error":"empty body"})", "application/json");
                res.set_header("Access-Control-Allow-Origin", "*");
                return;
            }

            json body = json::parse(req.body);

            // Access fields carefully to avoid exceptions
            std::string message = "";
            std::string model = "";
            if (body.contains("message") && body["message"].is_string()) message = body["message"].get<std::string>();
            if (body.contains("model") && body["model"].is_string()) model = body["model"].get<std::string>();

            // 2. Run Python
            std::string reply = run_python(message, model);

            // 3. Build JSON response
            json out = { {"reply", reply} };

            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(out.dump(), "application/json");
        } catch (const json::parse_error &e) {
            res.status = 400;
            res.set_header("Access-Control-Allow-Origin", "*");
            json err = { {"error", std::string("invalid JSON: ") + e.what()} };
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception &e) {
            res.status = 500;
            res.set_header("Access-Control-Allow-Origin", "*");
            json err = { {"error", std::string("server error: ") + e.what()} };
            res.set_content(err.dump(), "application/json");
        } });

    // --- Minimal HTTP server ---
    // Allow overriding the port with environment variable PORT or BACKEND_PORT
    int PORT = 5001; // default to non-system port to avoid macOS services
    const char *env_port = std::getenv("PORT");
    if (env_port)
        PORT = std::stoi(env_port);
    env_port = std::getenv("BACKEND_PORT");
    if (env_port)
        PORT = std::stoi(env_port);
    std::cout << "Server running on http://localhost:" << PORT << "\n";
    svr.listen("0.0.0.0", PORT);
}
