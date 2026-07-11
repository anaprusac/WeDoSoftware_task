using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WeDoSoftware.Api.Filters;

/// <summary>
/// Runs any registered FluentValidation validator for each action argument before the action executes,
/// returning an RFC 7807 <see cref="ValidationProblemDetails"/> (HTTP 400) on failure. Reusable across
/// all controllers, so validators never have to be invoked manually.
/// </summary>
public sealed class FluentValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var services = context.HttpContext.RequestServices;

        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
                continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (services.GetService(validatorType) is IValidator validator)
            {
                var result = await validator.ValidateAsync(new ValidationContext<object>(argument));
                if (!result.IsValid)
                {
                    foreach (var error in result.Errors)
                        context.ModelState.AddModelError(error.PropertyName, error.ErrorMessage);

                    context.Result = new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState));
                    return;
                }
            }
        }

        await next();
    }
}
