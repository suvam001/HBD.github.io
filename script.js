<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2685.3">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times; -webkit-text-stroke: #000000}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times; -webkit-text-stroke: #000000; min-height: 14.0px}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1">window.addEventListener('load', () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const nameElement = document.querySelector('.glitch-name');</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (nameElement) triggerHackerText(nameElement);</span></p>
<p class="p1"><span class="s1">});</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";</span></p>
<p class="p1"><span class="s1">let scrambleInterval = null;</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function triggerHackerText(element) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>let iteration = 0;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const originalText = element.dataset.value || element.innerText;</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (!element.dataset.value) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>element.dataset.value = originalText;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>clearInterval(scrambleInterval);</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>scrambleInterval = setInterval(() =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>element.innerText = originalText</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>.split("")</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>.map((letter, index) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>if(index &lt; iteration || letter === " ") {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>return originalText[index];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>return letters[Math.floor(Math.random() * 26)];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>})</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>.join("");</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>if(iteration &gt;= originalText.length){<span class="Apple-converted-space"> </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>clearInterval(scrambleInterval);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>iteration += 1 / 3;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}, 30);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">const nameEl = document.querySelector('.glitch-name');</span></p>
<p class="p1"><span class="s1">if (nameEl) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>nameEl.addEventListener('mouseover', function() {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>triggerHackerText(this);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p1"><span class="s1">}</span></p>
</body>
</html>
