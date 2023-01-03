# PrintFriendly
Adds some improved print functionality to any web page.

**Setup**
Reference the javascript, instantiate the class (recommended on document load)
<script>
  let pf = null;
  window.addEventListener('load', () => {
    pf = new PFApp();
  });
</script>

A user can open the print interface with Ctrl-P/Command-P

An onclick call can be added to any appropriate element to open the print interface: onclick="pf.enterPrintFriendlyMode()"

**Pre configured highlight Sections**
add a pfapp css class to any element to make it highlighted when toggling the PrintFriendly interface
  **Example**
  <p class="**pfapp**">This is a paragraph before a <strong>definition</strong> list (<code>dl</code>). In principle, such a list should consist of <em>terms</em> and associated definitions. But many authors use <code>dl</code> elements for fancy "layout" things. Usually the effect is not <em>too</em> bad, if you design user style sheet rules for <code>dl</code> which are suitable for real definition lists.</p>
