import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css';
import App from './App.tsx'
import {MantineProvider, createTheme} from "@mantine/core";

const theme = createTheme({
    primaryColor: 'iris',
    colors: {
        iris: [
            "#f8ecff",
            "#e9d6fb",
            "#ceaaf1",
            "#b37be8",
            "#9b54e0",
            "#8d3bdc",
            "#8126d9",
            "#7321c2",
            "#661cae",
            "#58149a",
            "#330d59"
        ],
        cobalt: [
            "#eef5fc",
            "#dce7f2",
            "#b4cce6",
            "#89b1dc",
            "#669ad3",
            "#518bce",
            "#4584cd",
            "#3771b5",
            "#2d65a3",
            "#194a7b"
        ]
    }
});
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider theme={theme}>
            <App/>
        </MantineProvider>
    </StrictMode>,
)
