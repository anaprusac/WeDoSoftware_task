namespace WeDoSoftware.Application.Common.Exceptions;

/// <summary>A business rule was violated by an otherwise well-formed request. Mapped to HTTP 400.</summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
