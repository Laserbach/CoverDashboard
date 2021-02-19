import { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MenuIcon from "@material-ui/icons/Menu";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import Toolbar from "@material-ui/core/Toolbar";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import DashboardIcon from "@material-ui/icons/Dashboard";
import BarChartIcon from "@material-ui/icons/BarChart";
import BuildIcon from "@material-ui/icons/Build";
import HelpIcon from "@material-ui/icons/Help";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";

import Home from "./pages/Home";
import Covers from "./pages/Covers";
import Cover from "./pages/Cover";
import Tools from "./pages/Tools";
import CoverProtocol from "./pages/CoverProtocol";
import { Divider } from "@material-ui/core";

const drawerWidth = 220;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    drawer: {
      [theme.breakpoints.up("md")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
      backgroundColor: theme.palette.background.default,
    },
    appBar: {
      [theme.breakpoints.up("md")]: {
        width: `100%`,
        marginLeft: drawerWidth,
        height: "67px",
      },
      flexGrow: 1,
      "border-bottom": "1px solid rgb(105, 105, 105)",
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(97,97,97,0.1) 0px, rgba(97,97,97,0.1) 2px,transparent 2px, transparent 4px),linear-gradient(90deg, rgb(33,34,44),rgb(33,34,44))",
    },
    title: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
      "border-right": "1px solid rgb(105, 105, 105)",
      marginTop: "66px",
      borderTop: "1px solid rgb(105, 105, 105)",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    link: {
      color: theme.palette.primary.main,
    },
  })
);

const App: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const pages = ["Dashboard", "Covers", "$COVER", "Tools"];
  const [mobileOpen = false, setMobileOpen] = useState<boolean>();
  const [pageSelected = pages[0], selectPage] = useState<string>();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getIconFromPage = (page: string) => {
    switch (page) {
      case pages[0]:
        return <DashboardIcon color="primary" />;
      case pages[1]:
        return <BarChartIcon color="primary" />;
      case pages[2]:
        return <AttachMoneyIcon color="primary" />;
      case pages[3]:
        return <BuildIcon color="primary" />;
      default:
        return <HelpIcon color="primary" />;
    }
  };

  const drawer = (
    <div
      style={{
        height: "calc(100% - 65px)",
        position: "relative",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(97,97,97,0.1) 0px, rgba(97,97,97,0.1) 2px,transparent 2px, transparent 4px),linear-gradient(90deg, rgb(33,34,44),rgb(33,34,44))",
      }}
    >
      <div className={classes.toolbar} />
      <List>
        {pages.map((text) => (
          <Link
            to={text === "Dashboard" ? "/" : `/${text.toLowerCase()}`}
            key={text}
            style={{
              textDecoration: "none",
              color: theme.palette.text.primary,
            }}
          >
            <ListItem
              selected={pageSelected === text}
              onClick={() => {
                selectPage(text);
                handleDrawerToggle();
              }}
              button
            >
              <ListItemIcon>{getIconFromPage(text)}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Box
        style={{
          textAlign: "center",
          bottom: 0,
          position: "absolute",
          width: "100%",
          padding: "20px",
        }}
      >
        <Divider />
        {/* <p>Found an issue?<br /><a href="https://github.com/Laserbach/CoverDashboard/issues" className={classes.link}>Open an Incident</a></p> */}
        <p>
          Maintained by{" "}
          <a href="https://twitter.com/laserbacher" className={classes.link}>
            Laserbach
          </a>
        </p>
      </Box>
    </div>
  );

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar color="inherit" position="fixed" className={classes.appBar}>
          <Toolbar style={{ paddingLeft: "10px" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <div className={classes.title}>
              <Link to={`/`} style={{ textDecoration: "none" }}>
                <Card
                  className={classes.title}
                  style={{
                    boxShadow: "none",
                    width: "200px",
                    backgroundColor: "transparent",
                  }}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      alt={`COVER protocol icon`}
                      height="65"
                      image={`${process.env.PUBLIC_URL}/images/protocols/COVER.png`}
                      className={classes.title}
                      style={{
                        objectFit: "contain",
                        width: "150px",
                        marginRight: "auto",
                        marginLeft: "auto",
                      }}
                    />
                  </CardActionArea>
                </Card>
              </Link>
            </div>
            <Button
              variant="contained"
              color="secondary"
              href="https://app.coverprotocol.com/"
              target="_blank"
              rel="noreferrer"
            >
              Buy Coverage
            </Button>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden mdUp implementation="css">
            <Drawer
              variant="persistent"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/covers" exact>
              <Covers />
            </Route>
            <Route path="/covers/:cover" exact component={Cover} />
            <Route path="/tools" exact>
              <Tools />
            </Route>
            <Route path="/$cover" exact>
              <CoverProtocol />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;
