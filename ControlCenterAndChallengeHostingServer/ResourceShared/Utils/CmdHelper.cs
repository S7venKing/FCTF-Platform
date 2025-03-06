using ResourceShared.Configs;
using System.Diagnostics;

namespace ResourceShared.Utils
{
    public class CmdHelper
    {
        public static string? ChallengeBasePath {get;set;}

        public static async Task<string> ExecuteBashCommandAsync(string WorkingPath,string command, bool IsNeedKctf)
        {
            try
            {
                Process process = new Process();

                process.StartInfo.FileName = "/bin/bash";
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.RedirectStandardInput = true;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = false;
                if (!string.IsNullOrEmpty(ChallengeBasePath))
                {
                    process.StartInfo.WorkingDirectory = ChallengeBasePath;
                }
                else
                {
                    process.StartInfo.WorkingDirectory = Environment.CurrentDirectory;
                }

                process.Start();

                if (IsNeedKctf)
                {
                    // await Console.Out.WriteLineAsync("source ne");
                    await process.StandardInput.WriteLineAsync($"source kctf/activate && export PATH=$PATH:{ChallengeBasePath}/kctf/bin");
                    await process.StandardInput.FlushAsync();
                }

                // Đổi đường dẫn làm việc sau khi source nếu WorkingPath được cung cấp
                if (!string.IsNullOrEmpty(WorkingPath))
                {
                    await process.StandardInput.WriteLineAsync($"cd \"{WorkingPath}\"");
                    await process.StandardInput.FlushAsync();
                }

                await process.StandardInput.WriteLineAsync(command);
                await process.StandardInput.FlushAsync();
                process.StandardInput.Close();


                string? output = "";
                string? error = "";
                //if (!waitForExit)
                //{
                //    var timeout = TimeSpan.FromSeconds(3);
                //    // Wait for either the process to complete or the timeout
                //    await Task.Delay(timeout);
                //    output = process.StandardOutput.ReadLine();
                //    error = process.StandardError.ReadLine();
                //}
                process.WaitForExit();
                output = await process.StandardOutput.ReadToEndAsync();
                error = await process.StandardError.ReadToEndAsync();
                return output + Environment.NewLine + error;
            }
            catch (Exception ex)
            {
                throw new(ex.Message);
            }
        }
    }
}
