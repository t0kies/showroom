// <stools-alert-box> — the box every overlay plays its alerts in. It
// renders one alert (any mix of text, media and sound, with an optional
// entrance animation). Moving and scaling it is the editor's job
// (editor.js), the same as for widgets; this element only lays itself
// out from {baseWidth, baseHeight, scale, x, y}.
//
// It's a plain custom element in light DOM, so css/overlay.css styles it.

const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'ogv']);
const ANIMATIONS = ['pop', 'fade', 'slide'].map((n) => `anim-${n}`);

// Content follows the box, so a bigger box means bigger alerts:
// text is a tenth of the box's height (about five lines fit with media),
// media is two fifths of its width (room for text beside a wide image).
const TEXT_RATIO = 1 / 10;
const MEDIA_RATIO = 2 / 5;

const isVideoURL = (url) => VIDEO_EXT.has(url.split(/[.?]/)[1]?.toLowerCase());

class AlertBox extends HTMLElement {
    connectedCallback() {
        this.classList.add('alert-box');
        this.innerHTML = '<div class="alert-media"></div><div class="alert-text"></div>';
        this._media = this.querySelector('.alert-media');
        this._text = this.querySelector('.alert-text');
        this._hideTimer = null;
        this.box = null;
    }

    // layout applies {baseWidth, baseHeight, scale, x, y}.
    layout(box) {
        this.box = { ...box };
        const w = box.baseWidth * box.scale;
        const h = box.baseHeight * box.scale;
        Object.assign(this.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${w}px`, height: `${h}px` });
        this.style.setProperty('--text-size', `${h * TEXT_RATIO}px`);
        this.style.setProperty('--media-width', `${w * MEDIA_RATIO}px`);
    }

    show({ text, mediaUrl, mediaType, soundUrl, duration, animation } = {}) {
        this._text.textContent = text || '';
        this._text.classList.toggle('visible', Boolean(text));

        this.classList.remove(...ANIMATIONS);
        if (animation && ANIMATIONS.includes(`anim-${animation}`)) {
            void this.offsetWidth; // restart the animation even if it repeats
            this.classList.add(`anim-${animation}`);
        }

        this._media.replaceChildren();
        if (mediaUrl) {
            const isVideo = mediaType ? mediaType === 'video' : isVideoURL(mediaUrl);
            this._media.appendChild(Object.assign(
                document.createElement(isVideo ? 'video' : 'img'),
                isVideo ? { src: mediaUrl, autoplay: true, muted: true } : { src: mediaUrl, alt: '' },
            ));
        }
        this._media.classList.toggle('visible', Boolean(mediaUrl));

        if (soundUrl) new Audio(soundUrl).play().catch(() => {});

        this.classList.add('active');
        clearTimeout(this._hideTimer);
        if (duration > 0) this._hideTimer = setTimeout(() => this.hide(), duration);
    }

    hide() {
        clearTimeout(this._hideTimer);
        this.classList.remove('active', ...ANIMATIONS);
        this._media.replaceChildren();
        this._media.classList.remove('visible');
        this._text.textContent = '';
        this._text.classList.remove('visible');
    }
}

customElements.define('stools-alert-box', AlertBox);
