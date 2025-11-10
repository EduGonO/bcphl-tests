import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/editeur",
      permanent: true,
    },
  };
};

const LegacyRedirect = () => null;

export default LegacyRedirect;
