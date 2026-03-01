document.addEventListener('DOMContentLoaded', function() {
    function syntaxHighlight() {
        if (hljs !== undefined) {
            var codeBlocks = document.querySelectorAll('pre code');
            for (var i = 0; i < codeBlocks.length; i++) {
                var codeBlock = codeBlocks[i];
                hljs.highlightElement(codeBlock);

                // Since the github css doesn't play nice with highlight.js, we
                // need to set the background of all `pre` elements to be the
                // color of the inner `code` block.
                codeBlock.parentNode.style.background = (
                    getComputedStyle(codeBlock)
                        .getPropertyValue('background'));
            }
        }
    }

    function renderMath() {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(
            document.getElementById("markdown-preview"),
            {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "\\[", right: "\\]", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false}
                ]
            }
        );
      }
    }

    var mermaidLoaded = false;
    var mermaidLoading = false;

    function loadMermaid() {
      if (mermaidLoaded || mermaidLoading) {
        return;
      }

      var codeBlocks = document.querySelectorAll('pre code.language-mermaid');
      if (codeBlocks.length === 0) {
        return;
      }

      mermaidLoading = true;

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
      script.onload = function() {
        mermaidLoaded = true;
        mermaidLoading = false;
        renderMermaid();
      };
      document.head.appendChild(script);
    }

    function renderMermaid() {
      if (typeof mermaid === 'undefined') {
        return;
      }

      mermaid.initialize({ startOnLoad: false });

      var codeBlocks = document.querySelectorAll('pre code.language-mermaid');
      if (codeBlocks.length === 0) {
        return;
      }

      codeBlocks.forEach(function(codeBlock) {
        var container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = codeBlock.textContent;

        codeBlock.parentNode.replaceWith(container);
      });

      mermaid.run();
    }


    syntaxHighlight();
    renderMath();
    loadMermaid();
    var previewWindow = document.getElementById('markdown-preview');
    var webSocketUrl = 'ws://' + window.location.host;

    var socket = new ReconnectingWebSocket(webSocketUrl);
    socket.maxReconnectInterval = 5000;

    socket.onmessage = function(event) {
        document.getElementById('markdown-preview').innerHTML = event.data;
        syntaxHighlight();
        renderMath();
        loadMermaid();
    }

    socket.onclose = function(event) {
        // Close the browser window.
        window.open('', '_self', '');
        window.close();
    }
});
