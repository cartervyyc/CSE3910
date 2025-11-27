#include <iostream>
#include <array>
#include <memory>
#include <string>
#include "../include/httplib.h"

std::string run_python(const std::string &input)
{
    // Get the python file path
    std::string cmd = "python3 ../../predict.py \"" + input + "\" 2>&1";

    // Reads python output 256 characters at a time
    std::array<char, 256> buffer{};
    std::string result;

    // Runs the command in the shell and creates a "pipe" to read the output
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd.c_str(), "r"), pclose);

    if (!pipe)
        return "Error running python";

    // Get 256 characters at a time and append the result to result
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr)
    {
        result += buffer.data();
    }

    return result;
}

int main()
{
    httplib::Server svr;

    svr.Post("/ask", [](const httplib::Request &req, httplib::Response &res)
             {
        std::string msg = req.body;
        std::string out = run_python(msg);
        res.set_content(out, "text/plain"); });

    std::cout << "Server running http://localhost:5000\n";
    svr.listen("0.0.0.0", 5000);
}