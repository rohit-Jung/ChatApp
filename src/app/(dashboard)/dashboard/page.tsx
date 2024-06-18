import { getServerSession } from "next-auth";
import { FC } from "react";
import { authOptions } from "../../api/auth/[...nextauth]/options";

interface DashBoardProps {
  defaultValue: string;
}

const DashBoard: FC<DashBoardProps> = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  return (
    <>
      <div className="">{JSON.stringify(session)}</div>
    </>
  );
};

export default DashBoard;
