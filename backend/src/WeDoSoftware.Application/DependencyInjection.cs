using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace WeDoSoftware.Application;

/// <summary>Composition root for the Application layer (validators; mapping is registered at the API root).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
