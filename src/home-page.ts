import { run } from "./common";
import { ContentWrapper } from "./contentWrapper";
import { MainConnectToFrame } from "./frameConnect";
import "animate.css";

export function init() {
    const button = document.createElement("button");
    const title = document.createElement("h1");
    button.innerHTML = "run";
    button.style.position = "fixed";
    button.style.zIndex = "10000000";
    title.style.position = "relative";
    title.style.zIndex = "10000000";
    document.body.appendChild(title);
    document.body.appendChild(button);
    run(async () => {
        const loop = async () => {
            const contentWrapper = new ContentWrapper(
                document.body,
                new URL("login", window.location.href).href
            );

            await new Promise((res) => {
                contentWrapper.onOpen(async () => {
                    // const src = new URL("login.html", window.location.href).href;
                    const iframe = contentWrapper.iframe;
                    if (!iframe) throw new Error("iframe is not defined");
                    const _iframe = new MainConnectToFrame(iframe);

                    await _iframe.connect();

                    let count = 0;
                    const props = {
                        name: "long",
                        onCall: (props: any) => {
                            console.log("call", props);
                        },
                        close: () => contentWrapper.close(),
                    };
                    const handle = () => {
                        count++;
                        props.name = "long" + count;
                        _iframe.setProps(props);
                    };

                    _iframe.onMethodCall(({ method }) => {
                        if (method === "onCall") {
                            handle();
                        }
                    });

                    _iframe.setProps(props);
                    contentWrapper.onClose(() => {
                        _iframe.destroy();
                        contentWrapper.destroy();
                        res(true);
                    });
                });
                contentWrapper.render();
            });
        };

        let count = 0;
        let startTime = new Date().getTime();
        const max = 1000;

        button.addEventListener("click", () => {
            if (count < max) {
                count = 1000;
                button.innerHTML = "rerun";
            } else {
                window.location.reload();
            }
        });
        while (count < max) {
            count++;
            await Promise.all([
              loop(),loop(),loop(),loop(),loop()
            ])
            const currentTime = new Date().getTime();
            title.innerHTML = `Time init and destroy: ${Math.round(
                (currentTime - startTime) / count
            )}ms`;
        }
    });
}
