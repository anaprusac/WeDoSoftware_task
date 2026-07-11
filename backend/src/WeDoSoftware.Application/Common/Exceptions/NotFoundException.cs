namespace WeDoSoftware.Application.Common.Exceptions;

/// <summary>Requested resource does not exist. Mapped to HTTP 404 by the global exception handler.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
