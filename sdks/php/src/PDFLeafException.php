<?php

declare(strict_types=1);

namespace PDFLeaf;

use Exception;

/**
 * Exception thrown for PDF Leaf API errors.
 */
class PDFLeafException extends Exception
{
    /**
     * HTTP status code (0 if not an HTTP error).
     */
    public int $status;

    /**
     * Additional error data from the API.
     *
     * @var array<string, mixed>
     */
    public array $data;

    /**
     * @param string $message Error message
     * @param int $status HTTP status code
     * @param array<string, mixed> $data Additional error data
     */
    public function __construct(string $message, int $status = 0, array $data = [])
    {
        parent::__construct($message, $status);
        $this->status = $status;
        $this->data = $data;
    }

    /**
     * Get a string representation of the exception.
     */
    public function __toString(): string
    {
        if ($this->status > 0) {
            return "PDFLeafException ({$this->status}): {$this->message}";
        }
        return "PDFLeafException: {$this->message}";
    }
}
