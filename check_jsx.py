import sys

def check_tags(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()

    stack = []
    for i, line in enumerate(lines):
        # Very crude JSX tag detection
        # This won't handle everything but might catch obvious mismatches
        import re
        tags = re.findall(r'<([a-zA-Z0-9\.]+)|</([a-zA-Z0-9\.]+)>', line)
        for open_tag, close_tag in tags:
            if open_tag:
                if open_tag not in ['img', 'br', 'hr', 'input', 'link', 'meta']: # self-closing
                     stack.append((open_tag, i+1))
            elif close_tag:
                if not stack:
                    print(f"Unexpected closing tag </{close_tag}> at line {i+1}")
                else:
                    last_open, line_num = stack.pop()
                    if last_open != close_tag:
                        print(f"Mismatched tag: opened <{last_open}> at line {line_num}, closed </{close_tag}> at line {i+1}")

    while stack:
        tag, line_num = stack.pop()
        print(f"Unclosed tag <{tag}> opened at line {line_num}")

check_tags('apps/studio/src/app/builder/page.tsx')
