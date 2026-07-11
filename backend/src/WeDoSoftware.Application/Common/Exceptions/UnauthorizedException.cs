namespace WeDoSoftware.Application.Common.Exceptions;

/// <summary>Authentication failed or credentials are invalid. Mapped to HTTP 401.</summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
