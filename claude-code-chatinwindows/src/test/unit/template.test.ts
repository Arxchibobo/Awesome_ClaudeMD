import { expect } from 'chai';
import { ProtocolParser, PROTOCOL_MARKERS } from '../../claudemd/protocol';

describe('Protocol Template Extraction', () => {
  const templateContent = `
# Some header
## 生成内容

\`\`\`markdown
${PROTOCOL_MARKERS.START}
# Actual Protocol
${PROTOCOL_MARKERS.END}
\`\`\`
`;

  it('should extract protocol from template if nested', () => {
    // Current parser might not handle this. Let's see.
    const parsed = ProtocolParser.parse(templateContent);
    // ProtocolParser.parse looks for START and END markers.
    // In templateContent, they are there.
    expect(parsed.asinitSection).to.contain('# Actual Protocol');
    expect(parsed.asinitSection).to.contain(PROTOCOL_MARKERS.START);
    expect(parsed.asinitSection).to.contain(PROTOCOL_MARKERS.END);
  });
});
