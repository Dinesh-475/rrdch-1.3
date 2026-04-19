import re, glob, os

html_files = glob.glob("/Users/octane/Downloads/RRDC/*.html")

# The shared script tags to insert before </body>
SHARED_SCRIPTS = """
    <script src="js/config.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/api.js"></script>
    <script src="js/script.js"></script>
"""

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fname = os.path.basename(fpath)
    
    # 1) Remove any old dynamically-injected chat widget HTML blocks
    content = re.sub(
        r'\s*<!-- Floating Chat Widget -->.*?</div>\s*</div>\s*(?=<style|</body>)',
        '\n',
        content,
        flags=re.DOTALL
    )
    
    # 2) Remove old inline chat <style> blocks injected by the patch script
    content = re.sub(
        r'\s*<style>\s*#chatBubble:hover.*?</style>\s*',
        '\n',
        content,
        flags=re.DOTALL
    )
    
    # 3) Remove old inline a11y HTML toolbar div blocks
    content = re.sub(
        r'\s*<div id="a11y-toolbar"[^>]*>.*?</div>\s*</div>\s*',
        '\n',
        content,
        flags=re.DOTALL
    )
    
    # 4) Remove old inline a11y CSS rules from <style> blocks
    content = re.sub(r'\s*#a11y-toolbar \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.a11y-btn \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.a11y-btn\.active \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.a11y-btn:hover \{[^}]+\}', '', content)
    content = re.sub(r'\s*body\.high-contrast \{[^}]+\}', '', content)
    content = re.sub(r'\s*body\.dyslexia-font \* \{[^}]+\}', '', content)
    
    # 5) Remove old inline chat CSS rules from <style> blocks
    content = re.sub(r'\s*\.chat-msg \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.chat-msg\.bot \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.chat-msg\.user \{[^}]+\}', '', content)
    content = re.sub(r'\s*\.chat-msg\.loading \{[^}]+\}', '', content)

    # 6) Remove old inline a11y JS functions
    content = re.sub(r'\s*// A11Y Toolbar\s*\n.*?(?=// Chat Assistant|</script>)', '', content, flags=re.DOTALL)
    
    # 7) Remove old inline chat JS functions (but keep other page-specific inline JS)
    content = re.sub(
        r'\s*// Chat Assistant\s*\n.*?function appendMsg\(text, type\) \{[^}]*\{[^}]*\}[^}]*\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 8) Remove old standalone chatBubble/chatPanel HTML if still left
    content = re.sub(r'\s*<div id="chatBubble"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'\s*<div id="chatPanel"[^>]*>.*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # 9) Make sure shared scripts are included before </body>
    # First remove any existing references to our new shared scripts to avoid duplicates
    content = re.sub(r'\s*<script src="js/config\.js"></script>', '', content)
    content = re.sub(r'\s*<script src="js/utils\.js"></script>', '', content)
    content = re.sub(r'\s*<script src="js/api\.js"></script>', '', content)
    
    # Also remove old script.js references since we'll add them in the shared block
    content = re.sub(r'\s*<script src="js/script\.js"></script>', '', content)
    
    # Insert shared scripts right before </body>
    content = content.replace('</body>', SHARED_SCRIPTS + '\n</body>')
    
    # Clean up empty style blocks
    content = re.sub(r'<style>\s*</style>', '', content)
    
    # Clean up multiple blank lines
    content = re.sub(r'\n{4,}', '\n\n', content)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {fname}")

print("\nDone! All files cleaned and updated.")
