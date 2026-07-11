namespace WeDoSoftware.Application.Common.Exceptions;

/// <summary>Request conflicts with current state (e.g. username taken). Mapped to HTTP 409.</summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
