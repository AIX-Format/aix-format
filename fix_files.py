import os

def fix_space():
    path = 'apps/studio/src/app/space/page.tsx'
    if not os.path.exists(path): return
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('graphData={graphData}*/}', 'graphData={graphData}')
    content = content.replace('{/*<ForceGraph2D', '<ForceGraph2D')
    content = content.replace('/> */}', '/>')
    with open(path, 'w') as f:
        f.write(content)

def fix_builder():
    path = 'apps/studio/src/app/builder/page.tsx'
    if not os.path.exists(path): return
    with open(path, 'r') as f:
        lines = f.readlines()

    # Based on CI errors, line 1177 </AnimatePresence> might be the extra one or misaligned
    # Also 1175, 1176 errors.
    # Let's look at 1170-1180 again.
    # 1175: </motion.div>
    # 1176: )}
    # 1177: </AnimatePresence>

    # Wait, if line 635 is <AnimatePresence mode="wait">
    # And it has multiple {currentStep === X && (...)} inside.
    # It should only have ONE child if mode="wait" is used with keys,
    # OR multiple if they are controlled correctly.

    # The error "Expected corresponding JSX closing tag for 'section'" at 1177
    # means 'section' (opened at 631) is being closed by something else or not closed.

    # Actually, let's just try to remove the suspected extra tags.
    # But I don't want to break it further.
    pass

fix_space()
