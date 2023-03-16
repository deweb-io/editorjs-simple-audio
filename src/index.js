/**
 * Build styles
 */
import './index.css';

import { IconAddBorder, IconStretch, IconAddBackground } from '@codexteam/icons';

/**
 * SimpleAudio Tool for the Editor.js
 * Works only with pasted audio URLs and requires no server-side uploader.
 *
 * @typedef {object} SimpleAudioData
 * @description Tool's input and output data format
 * @property {string} url — audio URL
 * @property {string} caption — audio caption
 * @property {boolean} autoplay - audio autoplay enabled
 * @property {boolean} muted - audio muted enabled
 * @property {boolean} controls - audio controls enabled
 * @property {object} image - thumbnail audio
 */
export default class SimpleAudio {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: SimpleAudioData, config: object, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    /**
     * Editor.js API
     */
    this.api = api;
    this.readOnly = readOnly;

    /**
     * When block is only constructing,
     * current block points to previous block.
     * So real block index will be +1 after rendering
     *
     * @todo place it at the `rendered` event hook to get real block index without +1;
     * @type {number}
     */
    this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1;

    /**
     * Styles
     */
    this.CSS = {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,

      /**
       * Tool's classes
       */
      wrapper: 'cdx-simple-audio',
      audioHolder: 'cdx-simple-audio__picture',
      caption: 'cdx-simple-audio__caption',
    };

    /**
     * Nodes cache
     */
    this.nodes = {
      wrapper: null,
      audioHolder: null,
      audio: null,
      caption: null,
      image: null
    };

    /**
     * Tool's initial data
     */
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      autoplay: data.autoplay !== undefined ? data.autoplay : false,
      controls: data.controls !== undefined ? data.controls : false,
      muted: data.muted !== undefined ? data.muted : false,
      image: data.image !== undefined ? data.image : { url: '' }
    };

    /**
     * Available audio tunes
     */
    this.tunes = [
      {
        name: 'autoplay',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
      },
      {
        name: 'muted',
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
      },
      {
        name: 'controls',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15.54 5.54L13.77 7.3 12 5.54 10.23 7.3 8.46 5.54 12 2zm2.92 10l-1.76-1.77L18.46 12l-1.76-1.77 1.76-1.77L22 12zm-10 2.92l1.77-1.76L12 18.46l1.77-1.76 1.77 1.76L12 22zm-2.92-10l1.76 1.77L5.54 12l1.76 1.77-1.76 1.77L2 12z"/><circle cx="12" cy="12" r="3"/><path fill="none" d="M0 0h24v24H0z"/></svg>`
      }
    ];
  }

  /**
   * Creates a Block:
   *  1) Show preloader
   *  2) Start to load an audio
   *  3) After loading, append audio and caption input
   *
   * @public
   */
  render() {
    const wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      loader = this._make('div', this.CSS.loading),
      audioHolder = this._make('div', this.CSS.audioHolder),
      image = this._make('img'),
      audio = this._make('audio'),
      caption = this._make('div', [this.CSS.input, this.CSS.caption], {
        contentEditable: !this.readOnly,
        innerHTML: this.data.caption || '',
      });

    caption.dataset.placeholder = 'Enter a caption';

    wrapper.appendChild(loader);

    if (this.data.url) {
      audio.src = this.data.url;
      audio.controls = this.data.controls;
      audio.autoplay = this.data.autoplay;
      audio.muted = this.data.muted;

    }

    if (this.data.iamge && this.data.iamge.url) {
      image.src = this.data.iamge.url
    }

    audio.onloadstart = () => {
      wrapper.classList.remove(this.CSS.loading);
      audioHolder.appendChild(audio);
      wrapper.appendChild(audioHolder);
      wrapper.appendChild(caption);
      loader.remove();
      this._acceptTuneView();
    };

    audio.onerror = (e) => {
      // @todo use api.Notifies.show() to show error notification
      console.log('Failed to load audio', e);
    };

    this.nodes.audioHolder = audioHolder;
    this.nodes.wrapper = wrapper;
    this.nodes.audio = audio;
    this.nodes.caption = caption;
    this.nodes.image = image;

    return wrapper;
  }

  /**
   * @public
   * @param {Element} blockContent - Tool's wrapper
   * @returns {SimpleAudioData}
   */
  save(blockContent) {
    const audio = blockContent.querySelector('audio'),
      caption = blockContent.querySelector('.' + this.CSS.input);

    if (!audio) {
      return this.data;
    }

    let savedData = Object.assign(this.data, {
      url: audio.src,
      caption: caption.innerHTML,
      controls: video.controls,
      autoplay: video.autoplay,
      muted: video.muted,
      image: {
        url: video.poster
      }
    });

    return savedData
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      url: {},
      controls: {},
      autoplay: {},
      muted: {},
      caption: {
        br: true,
      },
      image: {}
    };
  }

  /**
   * Notify core that read-only mode is suppoorted
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Read pasted audio and convert it to object url
   *
   * @static
   * @param {File} file
   * @returns {Promise<SimpleAudioData>}
   */
  onDropHandler(file) {
    return new Promise((resolve, reject) => {
      resolve({
        url: URL.createObjectURL(file),
        caption: file.name
      });
    });
  }

  /**
   * On paste callback that is fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted config
   */
  onPaste(event) {
    switch (event.type) {
      case 'tag': {
        const audio = event.detail.data;

        this.data = {
          url: audio.src,
        };
        break;
      }

      case 'pattern': {
        const { data: text } = event.detail;

        this.data = {
          url: text,
        };
        break;
      }

      case 'file': {
        const { file } = event.detail;

        this.onDropHandler(file)
          .then(data => {
            this.data = data;
          });

        break;
      }
    }
  }

  /**
   * Returns audio data
   *
   * @returns {SimpleAudioData}
   */
  get data() {
    return this._data;
  }

  /**
   * Set audio data and update the view
   *
   * @param {SimpleAudioData} data
   */
  set data(data) {
    this._data = Object.assign({}, this.data, data);

    if (this.nodes.audio) {
      this.nodes.audio.src = this.data.url;
      this.nodes.video.autoplay = this.data.autoplay;
      this.nodes.video.controls = this.data.controls;
      this.nodes.video.muted = this.data.muted;
    }

    if (this.nodes.caption) {
      this.nodes.caption.innerHTML = this.data.caption;
    }

    if (this.nodes.image) {
      this.nodes.image.src = this.data.image.url;
    }
  }

  /**
   * Specify paste substitutes
   *
   * @see {@link ../../../docs/tools.md#paste-handling}
   * @public
   */
  static get pasteConfig() {
    return {
      patterns: {
        audio: /https?:\/\/\S+\.(mp3|aac|wav|ogg)$/i,
      },
      tags: ['audio'],
      files: {
        mimeTypes: ['audio/*'],
      },
    };
  }

  /**
   * Returns audio tunes config
   *
   * @returns {Array}
   */
  renderSettings() {
    return this.tunes.map(tune => ({
      ...tune,
      label: this.api.i18n.t(tune.label),
      toggle: true,
      onActivate: () => this._toggleTune(tune.name),
      isActive: !!this.data[tune.name],
    }))
  };

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {Array|string} classNames  - list or name of CSS classname(s)
   * @param  {object} attributes        - any attributes
   * @returns {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Click on the Settings Button
   *
   * @private
   * @param tune
   */
  _toggleTune(tune) {
    this.data[tune] = !this.data[tune];
    this._acceptTuneView();
  }

  /**
   * Add specified class corresponds with activated tunes
   *
   * @private
   */
  _acceptTuneView() {
    this.tunes.forEach(tune => {
      this.nodes.audioHolder.classList.toggle(this.CSS.audioHolder + '--' + tune.name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`), !!this.data[tune.name]);

      if (tune.name === 'stretched') {
        this.api.blocks.stretchBlock(this.blockIndex, !!this.data.stretched);
      }
    });
  }
}
