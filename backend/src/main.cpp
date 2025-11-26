#include <iostream>
#include <array>
#include <memory>
#include <string>

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
    std::string user;
    std::cout << "You: ";
    getline(std::cin, user);

    std::string response = run_python(user);

    std::cout << "Bot: " << response << std::endl;

    return 0;
}