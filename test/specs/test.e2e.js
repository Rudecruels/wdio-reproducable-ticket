describe("My Login application", () => {
  it("should login with valid credentials", async () => {
    await browser.url("https://www.amazon.in/");

    await browser.pause(5000);
    const mxClick = await $('//*[@id="nav-xshop"]/a[2]');
    await mxClick.click();
    await browser.pause(1000);

    const extractedData = await browser.execute(async () => {
      function analyzeDOM(doHighlightElements = true) {
        let highlightIndex = 0; // Reset highlight index

        function highlightElement(element, index, parentIframe = null) {
          // Create or get highlight container
          let container = document.getElementById("wdio-highlight-container");
          if (!container) {
            container = document.createElement("div");
            container.id = "wdio-highlight-container";
            container.style.position = "fixed";
            container.style.pointerEvents = "none";
            container.style.top = "0";
            container.style.left = "0";
            container.style.width = "100%";
            container.style.height = "100%";
            container.style.zIndex = "2147483647"; // Maximum z-index value
            document.documentElement.appendChild(container);
          }

          const colors = [
            "#FF0000",
            "#00FF00",
            "#0000FF",
            "#FFA500",
            "#800080",
            "#008080",
            "#FF69B4",
            "#4B0082",
            "#FF4500",
            "#2E8B57",
            "#DC143C",
            "#4682B4",
          ];

          const colorIndex = index % colors.length;
          const baseColor = colors[colorIndex];
          const backgroundColor = `${baseColor}1A`; // 10% opacity version of the color
          // Create highlight overlay
          const overlay = document.createElement("div");
          overlay.style.position = "absolute";
          overlay.style.border = `2px solid ${baseColor}`;
          overlay.style.backgroundColor = backgroundColor;
          overlay.style.pointerEvents = "none";
          overlay.style.boxSizing = "border-box";
          // Position overlay based on element
          const rect = element.getBoundingClientRect();
          let top = rect.top;
          let left = rect.left;
          // Adjust position if element is inside an iframe
          if (parentIframe) {
            const iframeRect = parentIframe.getBoundingClientRect();
            top += iframeRect.top;
            left += iframeRect.left;
          }
          overlay.style.top = `${top}px`;
          overlay.style.left = `${left}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;
          // Create label

          const label = document.createElement("div");
          label.className = "wdio-highlight-label";
          label.style.position = "absolute";
          label.style.background = baseColor;
          label.style.color = "white";
          label.style.padding = "1px 4px";
          label.style.borderRadius = "4px";
          label.style.fontSize = `${Math.min(
            12,
            Math.max(8, rect.height / 2)
          )}px`; // Responsive font size

          label.textContent = index;
          // Calculate label position
          const labelWidth = 20; // Approximate width
          const labelHeight = 16; // Approximate height
          // Default position (top-right corner inside the box)
          let labelTop = top + 2;
          let labelLeft = left + rect.width - labelWidth - 2;
          // Adjust if box is too small
          if (rect.width < labelWidth + 4 || rect.height < labelHeight + 4) {
            // Position outside the box if it's too small
            labelTop = top - labelHeight - 2;
            labelLeft = left + rect.width - labelWidth;
          }
          // Ensure label stays within viewport
          if (labelTop < 0) labelTop = top + 2;
          if (labelLeft < 0) labelLeft = left + 2;
          if (labelLeft + labelWidth > window.innerWidth) {
            labelLeft = left + rect.width - labelWidth - 2;
          }
          label.style.top = `${labelTop}px`;
          label.style.left = `${labelLeft}px`;
          // Add to container
          container.appendChild(overlay);
          container.appendChild(label);
          // Store reference for cleanup
          element.setAttribute(
            "wdio-user-highlight-id",
            `wdio-highlight-${index}`
          );
          return index + 1;
        }
        // Helper function to generate XPath as a tree
        function getXPathTree(element, stopAtBoundary = true) {
          const segments = [];
          let currentElement = element;
          while (
            currentElement &&
            currentElement.nodeType === Node.ELEMENT_NODE
          ) {
            // Stop if we hit a shadow root or iframe
            if (
              stopAtBoundary &&
              (currentElement.parentNode instanceof ShadowRoot ||
                currentElement.parentNode instanceof HTMLIFrameElement)
            ) {
              break;
            }
            let index = 0;
            let sibling = currentElement.previousSibling;
            while (sibling) {
              if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName === currentElement.nodeName
              ) {
                index++;
              }

              sibling = sibling.previousSibling;
            }
            const tagName = currentElement.nodeName.toLowerCase();
            const xpathIndex = index > 0 ? `[${index + 1}]` : "";
            segments.unshift(`${tagName}${xpathIndex}`);
            currentElement = currentElement.parentNode;
          }
          return segments.join("/");
        }
        function isElementAccepted(element) {
          const leafElementDenyList = new Set([
            "svg",
            "script",
            "style",
            "link",
            "meta",
          ]);
          return !leafElementDenyList.has(element.tagName.toLowerCase());
        }
        function isInteractiveElement(element) {
          const interactiveElements = new Set([
            "a",
            "button",
            "details",
            "embed",
            "input",
            "label",
            "menu",
            "menuitem",
            "object",
            "select",
            "textarea",
            "summary",
          ]);
          const interactiveRoles = new Set([
            "button",
            "menu",
            "menuitem",
            "link",
            "checkbox",
            "radio",
            "slider",
            "tab",
            "tabpanel",
            "textbox",
            "combobox",
            "grid",
            "listbox",
            "option",
            "progressbar",
            "scrollbar",
            "searchbox",
            "switch",
            "tree",
            "treeitem",
            "spinbutton",
            "tooltip",
            "a-button-inner",
            "a-dropdown-button",
            "click",
            "menuitemcheckbox",
            "menuitemradio",
            "a-button-text",
            "button-text",
            "button-icon",
            "button-icon-only",
            "button-text-icon-only",
            "dropdown",
            "combobox",
          ]);
          const tagName = element.tagName.toLowerCase();
          const role = element.getAttribute("role");
          const ariaRole = element.getAttribute("aria-role");
          const tabIndex = element.getAttribute("tabindex");
          const hasInteractiveRole =
            interactiveElements.has(tagName) ||
            interactiveRoles.has(role) ||
            interactiveRoles.has(ariaRole) ||
            (tabIndex !== null && tabIndex !== "-1") ||
            element.getAttribute("data-action") === "a-dropdown-select" ||
            element.getAttribute("data-action") === "a-dropdown-button";
          if (hasInteractiveRole) return true;

          const style = window.getComputedStyle(element);

          const hasClickHandler =
            element.onclick !== null ||
            element.getAttribute("onclick") !== null ||
            element.hasAttribute("ng-click") ||
            element.hasAttribute("@click") ||
            element.hasAttribute("v-on:click");

          function getEventListeners(el) {
            try {
              return window.getEventListeners?.(el) || {};
            } catch (e) {
              const listeners = {};
              const eventTypes = [
                "click",
                "mousedown",
                "mouseup",
                "touchstart",
                "touchend",
                "keydown",
                "keyup",
                "focus",
                "blur",
              ];

              for (const type of eventTypes) {
                const handler = el[`on${type}`];
                if (handler) {
                  listeners[type] = [
                    {
                      listener: handler,
                      useCapture: false,
                    },
                  ];
                }
              }
              return listeners;
            }
          }

          const listeners = getEventListeners(element);
          const hasClickListeners =
            listeners &&
            (listeners.click?.length > 0 ||
              listeners.mousedown?.length > 0 ||
              listeners.mouseup?.length > 0 ||
              listeners.touchstart?.length > 0 ||
              listeners.touchend?.length > 0);

          const hasAriaProps =
            element.hasAttribute("aria-expanded") ||
            element.hasAttribute("aria-pressed") ||
            element.hasAttribute("aria-selected") ||
            element.hasAttribute("aria-checked");

          const isDraggable =
            element.draggable || element.getAttribute("draggable") === "true";

          return (
            hasAriaProps || hasClickHandler || hasClickListeners || isDraggable
          );
        }

        function isElementVisible(element) {
          const style = window.getComputedStyle(element);

          return (
            element.offsetWidth > 0 &&
            element.offsetHeight > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        }

        function isTopElement(element) {
          let doc = element.ownerDocument;

          if (doc !== window.document) {
            return true;
          }

          const shadowRoot = element.getRootNode();

          if (shadowRoot instanceof ShadowRoot) {
            const rect = element.getBoundingClientRect();
            const point = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };

            try {
              const topEl = shadowRoot.elementFromPoint(point.x, point.y);
              if (!topEl) return false;
              let current = topEl;
              while (current && current !== shadowRoot) {
                if (current === element) return true;
                current = current.parentElement;
              }

              return false;
            } catch (e) {
              return true; // If we can't determine, consider it visible
            }
          }

          const rect = element.getBoundingClientRect();
          const point = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };

          try {
            const topEl = document.elementFromPoint(point.x, point.y);
            if (!topEl) return false;
            let current = topEl;
            while (current && current !== document.documentElement) {
              if (current === element) return true;
              current = current.parentElement;
            }

            return false;
          } catch (e) {
            return true;
          }
        }

        function isTextNodeVisible(textNode) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const rect = range.getBoundingClientRect();
          return (
            rect.width !== 0 &&
            rect.height !== 0 &&
            rect.top >= 0 &&
            rect.top <= window.innerHeight &&
            textNode.parentElement?.checkVisibility({
              checkOpacity: true,
              checkVisibilityCSS: true,
            })
          );
        }

        function buildDomTree(node, parentIframe = null) {
          if (!node) return null;
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent.trim();

            if (textContent && isTextNodeVisible(node)) {
              return {
                type: "TEXT_NODE",
                text: textContent,
                isVisible: true,
              };
            }

            return null;
          }

          if (node.nodeType === Node.ELEMENT_NODE && !isElementAccepted(node)) {
            return null;
          }
          const nodeData = {
            tagName: node.tagName ? node.tagName.toLowerCase() : null,
            attributes: {},
            xpath:
              node.nodeType === Node.ELEMENT_NODE
                ? getXPathTree(node, true)
                : null,
            children: [],
          };

          if (node.nodeType === Node.ELEMENT_NODE && node.attributes) {
            const attributeNames = node.getAttributeNames?.() || [];
            for (const name of attributeNames) {
              nodeData.attributes[name] = node.getAttribute(name);
            }
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const isInteractive = isInteractiveElement(node);
            const isVisible = isElementVisible(node);
            const isTop = isTopElement(node);
            nodeData.isInteractive = isInteractive;
            nodeData.isVisible = isVisible;
            nodeData.isTopElement = isTop;

            if (isInteractive && isVisible && isTop) {
              nodeData.highlightIndex = highlightIndex++;
              if (doHighlightElements) {
                highlightElement(node, nodeData.highlightIndex, parentIframe);
              }
            }
          }

          if (node.shadowRoot) {
            nodeData.shadowRoot = true;
          }

          if (node.shadowRoot) {
            const shadowChildren = Array.from(node.shadowRoot.childNodes).map(
              (child) => buildDomTree(child, parentIframe)
            );
            nodeData.children.push(...shadowChildren);
          }

          if (node.tagName === "IFRAME") {
            try {
              const iframeDoc =
                node.contentDocument || node.contentWindow.document;
              if (iframeDoc) {
                const iframeChildren = Array.from(
                  iframeDoc.body.childNodes
                ).map((child) => buildDomTree(child, node));
                nodeData.children.push(...iframeChildren);
              }
            } catch (e) {
              console.warn("Unable to access iframe:", node);
            }
          } else {
            const children = Array.from(node.childNodes).map((child) =>
              buildDomTree(child, parentIframe)
            );
            nodeData.children.push(...children);
          }
          return nodeData;
        }
        return buildDomTree(document.body);
      }
      return analyzeDOM();
    });
  });
});
