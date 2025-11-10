import type { GetServerSideProps } from "next";

const EvenementsRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/IRL",
      permanent: false,
    },
  };
};

export default EvenementsRedirect;
