import { useMemo } from "react";
import DasfEditor from "./dasf/DasfEditor";
import DasfViewer from "./dasf/DasfViewer";
import { DASFParser } from "./dasf/parser";
import type { DasfDocument } from "./dasf/types";
import lettering from "./assets/lettering.svg";
import logo from "./assets/stemma.svg";
import bg from "./assets/wallpaper.webp";
import "./App.css";
import {
  BackgroundImage,
  Button,
  FileButton,
  Flex,
  Group,
  Image,
  Paper,
  Space,
  Stack,
  Transition,
} from "@mantine/core";
import {
  getHotkeyHandler,
  useDebouncedValue,
  useDisclosure,
  useLocalStorage,
} from "@mantine/hooks";

function App() {
  const [rawText, setRawText] = useLocalStorage<string>({
    key: "dasf-rawText",
    defaultValue: "",
  });
  const [debouncedText] = useDebouncedValue(rawText, 500);
  const [docsOpened, docsHandler] = useDisclosure();

  const { parsedDoc, error } = useMemo(() => {
    if (!debouncedText) {
      return {
        parsedDoc: { doc: null, title: null } as {
          doc: DasfDocument | null;
          title: string | null;
        },
        error: null as string | null,
      };
    }
    try {
      const parser = new DASFParser();
      const result = parser.parse(debouncedText);
      return { parsedDoc: result, error: null as string | null };
    } catch (err: unknown) {
      let message = "Unknown error";
      if (typeof err === "string") {
        message = err;
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof err.message === "string"
      ) {
        message = err.message;
      } else {
        try {
          message = String(err);
        } catch {
          message = "Unknown error";
        }
      }
      return { parsedDoc: { doc: null, title: null }, error: message };
    }
  }, [debouncedText]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const nameBase = (parsedDoc.title || "document").replace(/[^\w-]+/g, "_");
    const filename = `${nameBase}.dasf`;
    const content = rawText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <BackgroundImage src={bg}>
      <Paper px={12} radius={0} h={50}>
        <Flex gap={24} h={"100%"} align={"center"}>
          <Image fit={"contain"} h={36} w={36} src={logo} />
          <Group>
            <FileButton onChange={handleFileChange} accept=".dasf">
              {(props) => (
                <Button color={"gray.1"} variant={"transparent"} {...props}>
                  Upload .dasf
                </Button>
              )}
            </FileButton>
            <Button
              color={"gray.1"}
              variant={"transparent"}
              disabled={!rawText}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              color={"gray.1"}
              variant={"transparent"}
              onClick={() => {
                fetch("./example.dasf").then(async (res) => {
                  setRawText(await res.text());
                });
              }}
            >
              Use example
            </Button>
            <Button
              onClick={() => docsHandler.toggle()}
              color={"gray.1"}
              variant={"transparent"}
              title={"work in progress"}
              disabled
            >
              {docsOpened ? "Hide" : "Show"} docs
            </Button>
          </Group>
        </Flex>
      </Paper>
      <div
        onKeyDown={getHotkeyHandler([
          [
            "ctrl + S",
            () => {
              handleDownload();
            },
            { preventDefault: true },
          ],
        ])}
        className="app-container"
      >
        <Stack gap={0} className="editor-pane">
          <Space h={16} />
          <DasfEditor value={rawText} onChange={setRawText} />
        </Stack>
        <Stack gap={0} className="viewer-pane">
          <Transition mounted={docsOpened}>
            {(styles) => (
              <Paper radius={8} mb={10} style={styles} h={100}></Paper>
            )}
          </Transition>

          {error ? (
            <div className="error-message">{error}</div>
          ) : parsedDoc.doc ? (
            <DasfViewer
              doc={parsedDoc.doc}
              title={parsedDoc.title || "DASF Document"}
            />
          ) : (
            <div className={"center"}>
              <div>
                <img alt={"Logo DASF"} src={lettering} />
                <div className={"courtesy-message"}>
                  Open a .DASF file to start
                </div>
              </div>
            </div>
          )}
        </Stack>
      </div>
    </BackgroundImage>
  );
}

export default App;
