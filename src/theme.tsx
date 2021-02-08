import red from "@material-ui/core/colors/red";
import { createMuiTheme } from "@material-ui/core/styles";
import "fontsource-quicksand/600.css";

// A custom theme for this app
const theme = createMuiTheme({
  typography: {
    fontFamily: ["Quicksand"].join(","),
  },
  palette: {
    primary: {
      main: "#6060D6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#21222c",
      paper: "#21222c",
    },
    text: {
      primary: "#fff",
    },
  },
});

export default theme;
