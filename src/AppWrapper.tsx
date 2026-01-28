import { RouterProvider } from "react-router-dom";
import { Head } from "./internal-components/Head";
import { OuterErrorBoundary } from "./prod-components/OuterErrorBoundary";
import { router } from "./router";
import { ChakraProvider } from "@chakra-ui/react";


export const AppWrapper = () => {
  return (
    <OuterErrorBoundary>
      <ChakraProvider>
        <RouterProvider router={router} />
        <Head />
      </ChakraProvider>
    </OuterErrorBoundary>
  );
};