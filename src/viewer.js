import * as $ from 'jquery';
import { onBeforeUnmount, onUnmounted } from 'vue';

const generateRandom = () =>
	Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 10);

export default {
    name: 'drawio-preview',
    props: {
        filename: { type: String, default: null },
        fileid: { type: Number, default: null },
        isEmbedded: { type: Boolean, default: false },
    },
    render(createElement) {
        this.$emit('update:loaded', true);
        const rnd = generateRandom();
        const imgUrl = `/index.php/core/preview?fileId=${this.fileid}&x=-1&y=-1&a=1&${rnd}`;
        const padding = 15;

        const img = new Image();

        let reloadCounter = 0;
        const reloadTime = 5000;
        const reload = () => {
            const el = document.getElementById(`drawoi-${rnd}`);
            if (!el) return;
            reloadCounter++;
            img.src = `${imgUrl}&t=${reloadCounter}`;
            setTimeout(reload, reloadTime);
        }

        this.$nextTick(() => {
            const el = document.getElementById(`drawoi-${rnd}`);
            const proseMirror = $(el).closest('.ProseMirror');
            el.addEventListener('click', () => {
                if (proseMirror?.attr('contenteditable') == "false") return;
                this.openEditor(true);
                setTimeout(reload, reloadTime);
            });
        });
        img.onload = function(event) {
            const el = document.getElementById(
                `drawoi-${rnd}`,
            );
            if (!el) return;
            el.replaceChildren();

            const src = event.target.src;
            const img = document.createElement('div');
            img.style.height = `${this.height}px`;
            img.style.width = `100%`;
            img.style.background = `url(${src}) no-repeat center/contain`;
            img.style.cursor = 'pointer',
            img.style.margin = `${padding}px`,

            el.appendChild(img);
            const h = this.height + padding * 2;
            el.style.height = `${h}px`;
            el.style.minHeight = `${h}px`;
        }
        img.src = imgUrl;
        return createElement(
            'div',
            {
                attrs: { id: `drawoi-${rnd}` },
                style: {
                    background: 'white',
                    cursor: 'pointer',
                },
                class: [
                    'drawio',
                    'drawio-viewer__embedding',
                ],
            },
            '',
        );
    },
    computed: {
        isWB() {
            var extension = this.filename.substr(this.filename.lastIndexOf('.') + 1).toLowerCase();
           return String(extension == 'dwb');
        },
    },
    mounted() {
        if (!this.isEmbedded) {
            this.openEditor();
        }
    },
    methods: {
        openEditor(newTab = false) {
            OCA.DrawIO.OpenEditor(this.fileid, this.isWB, newTab);
        },
    },
};