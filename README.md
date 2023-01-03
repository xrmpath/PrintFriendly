# PrintFriendly
Adds some improved print functionality to any web page.

**Setup**
Reference the javascript, instantiate the class (recommended on document load)
<code>
  <script>
    let pf = null;
    window.addEventListener('load', () => {
      pf = new PFApp();
    });
  </script>
</code>
A user can open the print interface with Ctrl-P/Command-P

An onclick call can be added to any appropriate element to open the print interface: onclick="pf.enterPrintFriendlyMode()"

**Pre configured highlight Sections**
add a pfapp css class to any element to make it highlighted when toggling the PrintFriendly interface
  **Example**
  ```html
    <p class="pfapp">This is a paragraph.</p>
