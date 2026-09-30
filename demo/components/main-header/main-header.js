import Link from "next/link";
import logoImage from "@/assets/logo.png";
import Image from "next/image";
import classes from "./main-header.module.css";
import MainHeaderback from "./main-header-back";
import NavLink from "./nav-link";

export default function MainHeader() {
  return (
    <>
      <MainHeaderback />
      <header className={classes.header}>
        <Link className={classes.logo} href="/">
          <Image src={logoImage} alt=" a plate" priority />
        </Link>
        <nav className={classes.nav}>
          <ul>
            <li>
              <NavLink href="/meals">Browse Meals</NavLink>
            </li>
            <li>
              <NavLink href="/community">community</NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
