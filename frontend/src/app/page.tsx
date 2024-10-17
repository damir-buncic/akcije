import { Grid, Navbar, Sidebar, Banner, Logos } from "@/components";
import style from "./page.module.scss";

type Props = {
  searchParams?: { category?: string; page?: number; query?: string };
};

function Page({ searchParams }: Props) {
  return (
    <>
      <Navbar />
      <main className={style.main}>
        <Sidebar />
        <div className={style.mainContainer}>
          <Logos />
          <Banner />
          <Grid searchParams={searchParams} />
        </div>
      </main>
    </>
  );
}

export default Page;
