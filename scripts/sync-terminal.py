"""Refresh terminal content from the canonical classic profile (Python 3)."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = {
    'about': ('about', 'About'), 'work': ('projects', 'Projects'),
    'experience': ('experience', 'Experience'), 'education': ('education', 'Education'),
    'skills': ('skills', 'Interests & tools'), 'contact': ('contact', 'Contact'),
}


class ProfileParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = {}
        self.current = None
        self.parts = []
        self.skip_resource = False
        self.links = []
        self.link = None
        self.heading_parts = None
        self.last_heading = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'section' and attrs.get('id') in SECTIONS:
            self.current = attrs['id']
            self.parts = []
            self.links = []
            self.last_heading = ''
        if not self.current:
            return
        if tag == 'a':
            self.skip_resource = attrs.get('class') == 'resource'
            self.link = [[], attrs.get('href', '')]
        if tag == 'h3':
            self.heading_parts = []
        if tag in ('p', 'h2', 'h3', 'li', 'summary', 'br'):
            self.parts.append('\n')
        if tag == 'span' and attrs.get('class') in ('date', 'award-year'):
            self.parts.append(' — ')

    def handle_data(self, data):
        if self.current and not self.skip_resource:
            self.parts.append(data)
        if self.link:
            self.link[0].append(data)
        if self.heading_parts is not None:
            self.heading_parts.append(data)

    def handle_endtag(self, tag):
        if tag == 'a':
            if self.link:
                label, href = self.link
                if self.skip_resource or self.current == 'contact':
                    label = self.last_heading + ' ↗' if self.skip_resource else ''.join(label)
                    self.links.append([label, href])
            self.link = None
            self.skip_resource = False
        if tag == 'h3' and self.heading_parts is not None:
            self.last_heading = ''.join(self.heading_parts)
            self.heading_parts = None
        if tag in ('p', 'h2', 'h3', 'li', 'summary') and self.current:
            self.parts.append('\n')
        if tag == 'section' and self.current:
            command, title = SECTIONS[self.current]
            lines = [re.sub(r'\s+', ' ', line).strip() for line in ''.join(self.parts).splitlines()]
            text = re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip()
            self.sections[command] = {
                'text': text,
                'links': [[f'View {title.lower()}', f'../classic/#{self.current}']] + self.links,
            }
            self.current = None


parser = ProfileParser()
parser.feed((ROOT / 'classic/index.html').read_text())
assert len(parser.sections) == len(SECTIONS), 'Missing profile section'
(ROOT / 'terminal/content.json').write_text(json.dumps(parser.sections, indent=2, ensure_ascii=False) + '\n')
print(f'Synced {len(parser.sections)} sections from classic/index.html.')
