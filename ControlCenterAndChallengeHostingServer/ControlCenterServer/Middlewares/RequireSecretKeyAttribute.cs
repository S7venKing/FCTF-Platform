using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ResourceShared.Utils;

namespace ControlCenterServer.Middlewares
{
    public class RequireSecretKeyAttribute : ActionFilterAttribute
    {
        private readonly HashSet<string> _requiredFields = new HashSet<string> { };

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var headers = context.HttpContext.Request.Headers;

            if (!headers.ContainsKey("SecretKey"))
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 400,
                    Content = "Invalid Secret Key"
                };
                return;
            }

            string? receivedSecretKey = headers["SecretKey"];
            if (string.IsNullOrEmpty(receivedSecretKey))
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 400,
                    Content = "Invalid Secret Key"
                };
                return;
            }

            long unixTime = 0;
            Dictionary<string, string> data;

            if (context.HttpContext.Request.HasFormContentType)
            {

                var form = context.HttpContext.Request.Form;

                _requiredFields.UnionWith(form.Keys);
                if (form.ContainsKey("UnixTime"))
                {
                    unixTime = long.TryParse(form["UnixTime"], out var parsedUnixTime) ? parsedUnixTime : DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                }

                data = form
                    .Where(kv => _requiredFields.Contains(kv.Key) && !context.HttpContext.Request.Form.Files.Any(f => f.Name == kv.Key))
                    .ToDictionary(k => k.Key, v => v.Value.ToString());
            }
            else
            {
                context.HttpContext.Request.EnableBuffering();
                using (var reader = new StreamReader(context.HttpContext.Request.Body))
                {
                    string bodyContent = await reader.ReadToEndAsync();
                    context.HttpContext.Request.Body.Position = 0;
                    var bodyData = JsonSerializer.Deserialize<Dictionary<string, object>>(bodyContent);

                    if (bodyData == null)
                    {
                        context.Result = new ContentResult()
                        {
                            StatusCode = 400,
                            Content = "Invalid Json data"
                        };
                        return;
                    }

                    if (bodyData.ContainsKey("UnixTime"))
                    {
                        var a = bodyData["UnixTime"];
                        unixTime = Convert.ToInt64(bodyData["UnixTime"]);
                        bodyData.Remove("UnixTime");
                    }

                    data = bodyData
                        .Where(kv => _requiredFields.Contains(kv.Key) || _requiredFields.Count == 0)
                        .ToDictionary(k => k.Key, v => v.Value?.ToString() ?? string.Empty);
                }
            }

            if (data.ContainsKey("UnixTime")) data.Remove("UnixTime");
            string generatedSecretKey = SecretKeyHelper.CreateSecretKey(unixTime, data);

            if (receivedSecretKey != generatedSecretKey)
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 400,
                    Content = "Invalid Secret Key"
                };
                return;
            }

            await next();
        }
    }
}
