import { createTheme } from "../utils/theme";

export const THEMES = {
    DEFAULT: createTheme({
        background: '#f9f7fb',
        font: '#1b1928',
        link: '#1e6bf7',
        destructive: '#f50016',
        diagramm: '#d2e2f2',
        diagrammGreen: '#77DD77'
    }),
    DARK: createTheme({
        background: '#0f0f0f',
        font: '#f1f1f1',
        link: '#58a3fd',
        destructive: '#f50016',
        diagramm: '#58a3fd',
        diagrammGreen: '#2d9f59'
    })
}