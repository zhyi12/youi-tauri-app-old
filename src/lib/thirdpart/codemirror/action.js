import {load} from "../../youi/util/dom";
import {debounce} from "./util";

/**
 *
 * @param node
 * @param options
 * @returns {{destroy()}}
 */
export default function action (node, options = {}) {

    const resources = [
        { type: 'script', attr: 'src', value: `/js/codemirror.js`, id: 'codemirror' },
    ];

    let unbind = () => {
        //ignore
    };

    load(resources, () => {
        unbind = init({ ...options, container: node }, node)
    });

    return {
        destroy () {
            unbind();
        }
    }

}

function init (options, node) {
    const {basicSetup,EditorView} = window.CM["codemirror"];
    const lang = window.CM["@codemirror/lang-"+options.lang][options.lang];

    //const {markdown} = window.CM["@codemirror/lang-markdown"];

    const on_change = debounce(options.docChanged, 100);

    const editor = new EditorView({
        parent: node,
        extensions:[basicSetup].concat(options.extensions||[lang()]),
        dispatch(transaction) {
            this.update([transaction]);
            if(transaction.docChanged){
                on_change(transaction);
            }
        },
    });

    options.init({editor});

    return ()=>{
        //destroy
    }

}

