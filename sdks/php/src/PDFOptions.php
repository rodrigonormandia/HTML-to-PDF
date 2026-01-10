<?php

declare(strict_types=1);

namespace PDFLeaf;

/**
 * PDF generation options.
 */
class PDFOptions
{
    /**
     * @param string|null $pageSize Page size (A4, Letter, A3, A5, Legal, B4, B5)
     * @param string|null $orientation Page orientation (portrait, landscape)
     * @param string|null $marginTop Top margin with CSS units (e.g., '2cm')
     * @param string|null $marginBottom Bottom margin with CSS units
     * @param string|null $marginLeft Left margin with CSS units
     * @param string|null $marginRight Right margin with CSS units
     * @param bool|null $includePageNumbers Include page numbers
     * @param string|null $headerHtml Custom header HTML content
     * @param string|null $footerHtml Custom footer HTML content
     * @param string|null $headerHeight Header height with CSS units
     * @param string|null $footerHeight Footer height with CSS units
     * @param string|null $excludeHeaderPages Comma-separated page numbers to exclude header
     * @param string|null $excludeFooterPages Comma-separated page numbers to exclude footer
     */
    public function __construct(
        public ?string $pageSize = null,
        public ?string $orientation = null,
        public ?string $marginTop = null,
        public ?string $marginBottom = null,
        public ?string $marginLeft = null,
        public ?string $marginRight = null,
        public ?bool $includePageNumbers = null,
        public ?string $headerHtml = null,
        public ?string $footerHtml = null,
        public ?string $headerHeight = null,
        public ?string $footerHeight = null,
        public ?string $excludeHeaderPages = null,
        public ?string $excludeFooterPages = null,
    ) {
    }

    /**
     * Convert to API request array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $result = [];

        if ($this->pageSize !== null) {
            $result['page_size'] = $this->pageSize;
        }
        if ($this->orientation !== null) {
            $result['orientation'] = $this->orientation;
        }
        if ($this->marginTop !== null) {
            $result['margin_top'] = $this->marginTop;
        }
        if ($this->marginBottom !== null) {
            $result['margin_bottom'] = $this->marginBottom;
        }
        if ($this->marginLeft !== null) {
            $result['margin_left'] = $this->marginLeft;
        }
        if ($this->marginRight !== null) {
            $result['margin_right'] = $this->marginRight;
        }
        if ($this->includePageNumbers !== null) {
            $result['include_page_numbers'] = $this->includePageNumbers;
        }
        if ($this->headerHtml !== null) {
            $result['header_html'] = $this->headerHtml;
        }
        if ($this->footerHtml !== null) {
            $result['footer_html'] = $this->footerHtml;
        }
        if ($this->headerHeight !== null) {
            $result['header_height'] = $this->headerHeight;
        }
        if ($this->footerHeight !== null) {
            $result['footer_height'] = $this->footerHeight;
        }
        if ($this->excludeHeaderPages !== null) {
            $result['exclude_header_pages'] = $this->excludeHeaderPages;
        }
        if ($this->excludeFooterPages !== null) {
            $result['exclude_footer_pages'] = $this->excludeFooterPages;
        }

        return $result;
    }
}
