import {z as css} from './css/eztext-css.js';

export function formatMs(ms, decimals = 2) {
    if (!+ms) return '0 ms';
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['ms', 's', 'm'];
    const scales = [1, 1000, 60000];
    let i = 0;
    if(ms >= 1000) i = 1;
    if(ms >= 60000) i = 2;
    return `${i === 0 ? ms : (ms/scales[i]).toFixed(dm)}${sizes[i]}`;
}

export const timer = (var_name) => {
    function start(){
        T.T1 = Date.now();
        return this;
    }
    function stop(){
        T.T2 = Date.now() - T.T1;
        return T.T2;
    }
    const T = {
        var_name: var_name,
        T1: 0.0,
        T2: 0.0,
        start,
        stop
    }
    return T
}

export function eztext(dom_node_id){

    const check_line = () => Math.min(ez.max_lines, Math.max(ez.num_lines, ez.min_lines));

    const lines_delta = () => {
        ez.content_lines = `${ez.field.value}`.split('\n').length;
        if(ez.content_lines !== ez.content_lines_delta){
            ez.content_lines_delta = ez.content_lines;
            ez.resize();
        }
    }

    function set_text(txt, is_log=false){
        if(is_log){
            ez.field.value = formatMs(ez.timer.stop())+'\t'+txt+'\n'+ez.field.value;
        }else{
            ez.field.value = txt;
        }
        lines_delta();
    }

    function get_text(){
        return ez.field.value;
    }

    function get_pos() {
        const textLines = ez.field.value.substr(0, ez.field.selectionStart).split("\n");
        return {line:textLines.length, col:textLines[textLines.length - 1].length};
    }

    function getInputSelection() {
        const sel = ez.field.value.substring(ez.field.selectionStart, ez.field.selectionEnd);
        if(sel.indexOf(':')!==-1){
            const col = sel.split(':');
            set_colors(col[0],col[1]);
        }


        if(['red','blue'].includes(sel)) set_colors(sel, null);
        return sel.length > 50 ? `${sel.substring(0,50)}...(${sel.length})` : sel;
    }

    function key_released(evt){ //keyup
        ez.cursor = get_pos();
        ez.info.textContent = `[${getInputSelection()}] R:${ez.cursor.line-1} C:${ez.cursor.col} (${ez.field.value.length} chars)`;
        lines_delta();
    }

    function key_pressed(evt) { //keydown
        ez.cursor = get_pos();
        //# delete is 8
        //# return is 13
        //# tab is 9
        //https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea

        if (evt.keyCode === 9) {
            evt.preventDefault(); // prevent usual browser behaviour
            let { value, selectionStart, selectionEnd } = ez.field;
            ez.field.value = value.slice(0, selectionStart) + "\t" + value.slice(selectionEnd);
            ez.field.setSelectionRange(selectionStart+1, selectionStart+1);
            return;
        }

        if (evt.keyCode === 9 && ez.cursor.col === 0) {
            ez.content_lines--;
            return ez.resize();
        }

        if (evt.keyCode === 13) {
            ez.content_lines++;
            return ez.resize();
        }

        lines_delta();
    }

    const l_n = (i, txt) => {
        const line = document.createElement('div');
        line.innerText = txt;
        return {
            i:i,
            txt:txt,
            dom: line
        }
    }

    function resize(){
        if(ez.content_lines > ez.min_lines) ez.num_lines = ez.content_lines;
        const ht = (check_line() * ez.line_height) + 'px';

        ez.numbers.style.height = ht;
        ez.field.style.height = ht;
        ez.dom_node.style.height = ht;
        ez.content.style.height = (ez.content_lines * ez.line_height) + 'px';

        const max_num = Math.max(ez.content_lines, ez.min_lines);

        for(let i = 0; i < max_num; i++){
            const pre_text = `${i}`.padStart(2, '0');
            if(ez.line_numbers.list[i] === undefined){
                const l = l_n(i, pre_text);
                ez.line_numbers.list.push(l);
                ez.numbers.appendChild(l.dom);
            }else{
                ez.line_numbers.list[i].innerText = pre_text;
            }
        }

        // for(let i = max_num-1; i < ez.numbers.children.length; i++){
        //     ez.numbers.removeChild(ez.numbers.children[i]);
        // }
        // ez.line_numbers.list = ez.line_numbers.list.slice(0, max_num-1);
        return true;
    }


    function set_colors(bg,fg){
        ez.dom_node.style.backgroundColor = bg;
        ez.dom_node.style.color = fg;
    }

    function init(){
		const style = document.createElement('style');
		style.textContent = css;
		document.body.appendChild(style);

        ez.dom_node.classList.add('ez-dom');

        ez.info = document.createElement('div');
        ez.info.classList.add('ez-info');

        ez.content = document.createElement('div');
        ez.content.classList.add('ez-content');

        ez.numbers = document.createElement('div');
        ez.numbers.classList.add('ez-lines');
        ez.numbers.setAttribute('id','ez-numbers');
        ez.numbers.style.lineHeight = `${ez.line_height}px`;

        ez.field = document.createElement('textarea');
        ez.field.classList.add('ez-field');
        ez.field.setAttribute('id','ez-field');
        ez.field.setAttribute('placeholder','eztext');
        ez.field.style.lineHeight = `${ez.line_height}px`;

        ez.field.addEventListener('keyup', ez.key_released);
        ez.field.addEventListener('keydown', ez.key_pressed);
        ez.field.addEventListener('mouseup', ez.key_released);
        // ez.field.addEventListener('selectionchange', ez.key_released);

        let scroll_caller = null;
        function handle_scroll(evt){
			evt.preventDefault();
			if(evt.target.scrollTop < 0) evt.target.scrollTo(0,0);
            ez.content.scroll({top:evt.target.scrollTop});
            if(scroll_caller === 'ez-numbers') ez.field.scroll({top:evt.target.scrollTop});
            if(scroll_caller === 'ez-field') ez.numbers.scroll({top:evt.target.scrollTop});
        }

		ez.field.onchange = () => lines_delta();
		ez.field.oninput = () => lines_delta();

        // ez.field.onscroll = (evt) => handle_scroll(evt);
        // ez.numbers.onscroll = (evt) => handle_scroll(evt);
        ez.field.onmouseenter = () => {scroll_caller = 'ez-field'};
        ez.numbers.onmouseenter = () => {scroll_caller = 'ez-numbers'};
        ez.field.ontouchstart = () => {scroll_caller = 'ez-field'};
        ez.numbers.ontouchstart = () => {scroll_caller = 'ez-numbers'};

        ez.field.addEventListener('scroll', handle_scroll, { passive: false });
        ez.numbers.addEventListener('scroll', handle_scroll, { passive: false });
        // ez.field.addEventListener('mouseenter', (evt) => {scroll_caller = 'ez-field'}, { passive: true });
        // ez.numbers.addEventListener('mouseenter', (evt) => {scroll_caller = 'ez-numbers'}, { passive: true });

        document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });


        ez.dom_node.appendChild(ez.content);
        ez.dom_node.appendChild(ez.numbers);
        ez.dom_node.appendChild(ez.field);
        ez.dom_node.appendChild(ez.info);

        ez.resize();
        return ez;
    }

    const ez = {
        timer: timer('log').start(),
        cursor:{
            line: null,
            col: null,
        },
        line_numbers: {list:[]},
        content_lines: 1,
        content_lines_delta: 1,
        num_lines: 10,
        min_lines: 10,
        max_lines: 20,
        line_height: 16,
        dom_node: document.getElementById(dom_node_id),
        field: null,
        numbers: null,
        info: null,
        set_text,
        get_text,
        init,
        key_pressed,
        key_released,
        resize
    }

    return ez;
}
