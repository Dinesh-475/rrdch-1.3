import re

with open('js/public-shell.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Regex to remove the social-media-strip
js = re.sub(r'<!-- Social Media Floating Strip -->.*?</div>', '', js, flags=re.DOTALL)

with open('js/public-shell.js', 'w', encoding='utf-8') as f:
    f.write(js)
