#!/usr/bin/env python3
"""You + robot hero loop: Kling i2v on a chroma-green composite, keyed to a transparent loop.

Usage:
  python3 duo.py generate [a b c d]  # Kling takes on duo-green.png -> duo/cand-<k>.mp4 (about $0.35 to $0.70 each)
  python3 duo.py encode <take.mp4> [start_s] [end_s] [size]  # numpy key + seamless ping-pong + VP9/HEVC alpha + poster
  python3 duo.py matte <clip.mp4> <name> [width] [frames]  # white-bg clip -> macOS Vision cutout per frame -> alpha loop <name>.webm/.mov
Inputs/outputs live next to this script in _build/duo/ (raw) and ../assets/video (final).
Alpha delivery: Safari/iOS get the HEVC-alpha .mov, everyone else the VP9-alpha .webm (base.js picks, see data-alpha).
"""
import os, pathlib, shutil, subprocess, sys, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
WORK = HERE / 'duo'; WORK.mkdir(exist_ok=True)
OUT = HERE.parent / 'assets' / 'video'
GREEN = '0x00B140'
NEG = ("face morphing, changing identity, different person, distorted face, extra fingers, extra limbs, camera movement, zoom, pan, "
       "background change, shadows on background, lighting change, flicker, text, watermark")
_SAME = "Static locked-off camera. The flat green background stays perfectly uniform and still."
VARIANTS = {  # name: (endpoint, prompt). Four takes, judged side by side; only the winner ships.
    'a': ("fal-ai/kling-video/v2.6/pro/image-to-video",
          "The small white robot standing on the man's shoulder waves hello with its raised hand and bobs gently. "
          "The man keeps his warm smile and gives a small friendly nod. His face stays exactly the same. Subtle, natural motion. " + _SAME),
    'b': ("fal-ai/kling-video/v2.6/pro/image-to-video",
          "The man holds still with the same warm smile, blinking naturally and breathing softly. "
          "The small white robot standing on his shoulder waves hello and its glowing eyes blink. " + _SAME),
    'c': ("fal-ai/kling-video/v2.6/pro/image-to-video",
          "The small white robot standing on the man's shoulder waves at the camera, then turns its head toward the man. "
          "The man glances at the robot and smiles. Same face, subtle natural motion. " + _SAME),
    'd': ("fal-ai/kling-video/v2.1/pro/image-to-video",
          "The small white robot standing on the man's shoulder waves hello with its raised hand and bobs gently. "
          "The man keeps his warm smile and gives a small friendly nod. His face stays exactly the same. Subtle, natural motion. " + _SAME),
}


def generate(names=None):
    """Kling i2v takes on duo/duo-green.png -> duo/cand-<name>.mp4, run concurrently."""
    import concurrent.futures as cf, json, time
    os.environ["FAL_KEY"] = (pathlib.Path.home() / ".claude/secrets/fal-key.txt").read_text().strip()
    import fal_client
    url = fal_client.upload_file(str(WORK / 'duo-green.png'))
    names = names or list(VARIANTS)

    def one(k):
        ep, prompt = VARIANTS[k]
        t0 = time.time()
        try:
            r = fal_client.subscribe(ep, arguments={"prompt": prompt, "image_url": url, "duration": "5", "negative_prompt": NEG, "cfg_scale": 0.6}, with_logs=False)
            out = WORK / f'cand-{k}.mp4'
            urllib.request.urlretrieve(r["video"]["url"], out)
            return f'OK {k} {ep} {out.stat().st_size // 1024} KB {time.time() - t0:.0f}s'
        except Exception as e:
            return f'FAIL {k} {ep}: {str(e)[:220]}'
    with cf.ThreadPoolExecutor(max_workers=len(names)) as ex:
        for line in ex.map(one, names):
            print(line, flush=True)
    (WORK / 'variants.json').write_text(json.dumps({k: {'endpoint': VARIANTS[k][0], 'prompt': VARIANTS[k][1]} for k in names}, indent=1))


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print(p.stderr[-1500:]); sys.exit(p.returncode)


def encode(raw, start='0.33', end='2.96', size='880'):
    """Kling take on flat green -> per-frame key in numpy -> seamless ping-pong: duo.webm (VP9 alpha), duo.mov (HEVC alpha), duo-poster.webp.
    Keying (after the judge review of 2026-10-16): ffmpeg chromakey for the base matte, NO global despill (it turned the robot's cyan
    eyes periwinkle and the whites lavender), bright pixels with B >= G-10 held opaque (eyes, ear ring), edge band un-mixed against
    the take's own key green, green capped at max(R,B), Kling's dark hair contour choked only outside the robot (keeps its fingers),
    colours bled into transparent pixels so 4:2:0 chroma cannot pull a teal fringe into the edges."""
    import numpy as np
    from PIL import Image, ImageFilter, ImageStat
    fr, out = WORK / 'enc-frames', WORK / 'enc-keyed'
    for d in (fr, out):
        shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-an', '-vf', f'trim={start}:{end},setpts=PTS-STARTPTS,fps=24', str(fr / 'r%04d.png')])
    first = sorted(fr.glob('r*.png'))[0]
    K = np.array(ImageStat.Stat(Image.open(first).convert('RGB').crop((4, 4, 60, 60))).median, float)
    key = '0x%02X%02X%02X' % tuple(int(v) for v in K)
    run(['ffmpeg', '-v', 'error', '-y', '-i', str(fr / 'r%04d.png'), '-vf', f'chromakey={key}:0.11:0.06,format=rgba', str(fr / 'k%04d.png')])
    frames = sorted(fr.glob('r*.png'))
    W, H = Image.open(frames[0]).size
    robot = np.zeros((H, W), bool)
    robot[int(H * .31):int(H * .70), int(W * .62):int(W * .935)] = True  # robot box (with bob and wave margin): no choke here
    n = int(size) // 2 * 2
    for f in frames:
        rgb = np.asarray(Image.open(f).convert('RGB')).astype(float)
        a = np.asarray(Image.open(fr / f.name.replace('r', 'k', 1)))[..., 3].astype(float) / 255
        R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        a = np.where((B >= G - 10) & (rgb.max(2) > 100), 1.0, a)               # hold out cyan eyes, ear ring, whites
        o = rgb.copy(); band = (a > 0.02) & (a < 1); am = a[band][:, None]
        o[band] = np.clip((rgb[band] - (1 - am) * K) / am, 0, 255)             # un-mix the key green from edge pixels
        o[..., 1] = np.minimum(o[..., 1], np.maximum(o[..., 0], o[..., 2]))    # spill limiter that leaves cyan alone
        am_img = Image.fromarray((a * 255).round().astype(np.uint8), 'L')
        choked = np.asarray(am_img.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(0.7))).astype(float) / 255
        a = np.where(robot, a, choked)                                        # Kling's dark hair contour, about 3 px at 1440
        w = Image.fromarray((a * 255).round().astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(6))
        prem = Image.fromarray((o * a[..., None]).round().astype(np.uint8), 'RGB').filter(ImageFilter.GaussianBlur(6))
        wb = np.asarray(w).astype(float)[..., None] / 255; pb = np.asarray(prem).astype(float)
        bled = np.where(wb > 0.004, pb / np.maximum(wb, 0.004), o)
        o = np.where((a < 0.5)[..., None], bled, o)                           # colour-bleed into the transparent side
        im = Image.fromarray(np.clip(o, 0, 255).round().astype(np.uint8), 'RGB').resize((n, n), Image.LANCZOS)
        im.putalpha(Image.fromarray((a * 255).round().astype(np.uint8), 'L').resize((n, n), Image.LANCZOS))
        im.save(out / f.name)
    N = len(frames)
    # forward f0..fN-1, back fN-2..f1: no frame repeats at either turnaround, so the loop has no hold
    pp = f"[0:v]split[a][b];[b]reverse,trim=start_frame=1:end_frame={N - 1},setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0"
    pat = str(out / 'r%04d.png')
    webm, mov = OUT / 'duo.webm', OUT / 'duo.mov'
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', pat, '-filter_complex', pp + ',format=yuva420p[v]', '-map', '[v]',
         '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-crf', '32', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', str(webm)])
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', pat, '-filter_complex', pp + ',format=bgra[v]', '-map', '[v]',
         '-c:v', 'hevc_videotoolbox', '-allow_sw', '1', '-alpha_quality', '0.75', '-q:v', '55', '-tag:v', 'hvc1', '-movflags', '+faststart', str(mov)])
    Image.open(sorted(out.glob('r*.png'))[0]).save(OUT / 'duo-poster.webp', 'WEBP', quality=88, method=6)
    # gate: decode the shipped webm with alpha and check the robot's eyes are opaque and cyan, background clear
    chk = WORK / 'gate.png'
    run(['ffmpeg', '-v', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', str(webm), '-frames:v', '1', '-pix_fmt', 'rgba', str(chk)])
    g = np.asarray(Image.open(chk).convert('RGBA')).astype(float)
    sub = g[int(n * .36):int(n * .47), int(n * .70):int(n * .87)]
    eye = (sub[..., 2] > 160) & (sub[..., 1] > 120) & ((sub[..., 2] - sub[..., 0]) > 60)
    clear = (g[..., 3] < 10).mean()
    print(f'key {key}, frames {N} ({start}s to {end}s) -> loop {2 * N - 2} frames, {n}px')
    print(f'  gate: background clear {clear:.0%}; robot eye pixels {int(eye.sum())}, alpha min {int(sub[eye][:, 3].min()) if eye.any() else -1}, median rgb {np.median(sub[eye][:, :3], 0).astype(int).tolist() if eye.any() else None}')
    print('  mov:', subprocess.run([tool('movalpha'), str(mov)], capture_output=True, text=True).stdout.strip().replace(chr(10), ' | '))
    for f in [webm, mov, OUT / 'duo-poster.webp']:
        print(' ', f.name, f.stat().st_size // 1024, 'KB')


def tool(name):
    """Compile a Swift helper from tools/ on first use (macOS only)."""
    binp = WORK / name
    if not binp.exists():
        run(['swiftc', '-O', str(HERE / 'tools' / f'{name}.swift'), '-o', str(binp)])
    return str(binp)


def matte(clip, name, width='256', frames='84'):
    from PIL import Image, ImageChops, ImageFilter
    fr, cut, fin = WORK / f'{name}-frames', WORK / f'{name}-cut', WORK / f'{name}-final'
    for d in (fr, cut, fin):
        shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    run(['ffmpeg', '-v', 'error', '-y', '-i', clip, str(fr / 'f%04d.png')])
    run([tool('batchcut'), str(fr), str(cut)])
    files = sorted(cut.glob('*.png'))[:int(frames)]  # 3.5s forward, ping-pong to 7s
    bb = None
    for f in files:
        b = Image.open(f).getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    pad = 6; bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), bb[2] + pad, bb[3] + pad)
    W = int(width) // 2 * 2; H = int(round(W * (bb[3] - bb[1]) / (bb[2] - bb[0]))) // 2 * 2
    alphas = [Image.open(f).crop(bb).getchannel('A') for f in files]
    for i, f in enumerate(files):
        a, b, c = alphas[max(0, i - 1)], alphas[i], alphas[min(len(files) - 1, i + 1)]
        med = ImageChops.lighter(ImageChops.darker(a, b), ImageChops.darker(ImageChops.lighter(a, b), c))  # temporal median: kills edge shimmer
        med = med.filter(ImageFilter.MinFilter(3)).point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 255 / 200)))  # 1px choke + tighter ramp: no white fringe
        # keep the clip's own (white) backdrop in the colour plane and resize colour and matte separately:
        # premultiplying would turn every transparent pixel black, and the encoder smears that into dark edge halos
        rgb = Image.open(fr / f.name).convert('RGB').crop(bb).resize((W, H), Image.LANCZOS)
        rgb.putalpha(med.resize((W, H), Image.LANCZOS))
        rgb.save(fin / f.name)
    # hqdn3d only takes alpha-less formats, so ffmpeg would silently drop the matte: denoise colour, then merge the matte back
    base = ("[0:v]format=rgba,split[c][m];[c]format=yuv444p,hqdn3d=1.5:1.5:5:5[c1];[m]alphaextract[m1];[c1][m1]alphamerge,"
            "split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0")  # ping-pong loop
    pat = str(fin / 'f%04d.png')
    webm, mov = OUT / f'{name}.webm', OUT / f'{name}.mov'
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', pat, '-filter_complex', base + ',format=yuva420p[v]', '-map', '[v]',
         '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', str(webm)])
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', pat, '-filter_complex', base + ',format=bgra[v]', '-map', '[v]',
         '-c:v', 'hevc_videotoolbox', '-allow_sw', '1', '-alpha_quality', '0.7', '-q:v', '45', '-tag:v', 'hvc1', '-movflags', '+faststart', str(mov)])
    Image.open(fin / files[0].name).save(OUT / f'{name}-poster.webp', 'WEBP', quality=88, method=6)
    chk = WORK / 'alpha-check.raw'
    run(['ffmpeg', '-v', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', str(webm), '-frames:v', '1', '-vf', 'alphaextract', '-f', 'rawvideo', '-pix_fmt', 'gray', str(chk)])
    d = chk.read_bytes(); clear = sum(1 for b in d if b < 10) / len(d)
    print(f'  webm transparency check: {clear:.0%} clear pixels' + ('' if clear > 0.05 else '  <-- ALPHA LOST, do not ship'))
    print('  mov:', subprocess.run([tool('movalpha'), str(mov)], capture_output=True, text=True).stdout.strip().replace(chr(10), ' | '))
    print(f'{name}: {W}x{H}, crop {bb}')
    for f in (webm, mov, OUT / f'{name}-poster.webp'):
        print(' ', f.name, f.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'generate':
        generate(sys.argv[2:] or None)
    elif len(sys.argv) > 3 and sys.argv[1] == 'matte':
        matte(sys.argv[2], sys.argv[3], *sys.argv[4:6])
    elif len(sys.argv) > 2 and sys.argv[1] == 'encode':
        encode(sys.argv[2], *sys.argv[3:6])
    else:
        print(__doc__)
