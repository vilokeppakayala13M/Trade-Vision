import type React from 'react';

interface JsonLdProps {
    data: Record<string, unknown>;
}

// Renders structured data as a JSON-LD <script> tag for rich search results
// Usage: <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', ... }} />
export default function JsonLd({ data }: JsonLdProps): React.ReactElement {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
