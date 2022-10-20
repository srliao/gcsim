import axios from "axios";
import { throttle } from "lodash";
import Pako from "pako";
import { useCallback, useEffect, useRef, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "~src/store";
import { SimResults } from "./SimResults";
import UpgradeDialog from "./UpgradeDialog";
import Viewer from "./Viewer";
import { viewerActions } from "./viewerSlice";
import { validate as uuidValidate } from 'uuid';

export const VIEWER_THROTTLE = 100;

export enum ResultSource {
  Loaded,
  Generated,
}

export enum ViewTypes {
  Landing,
  Upload,
  Web,
  Local,
  Share,
}

type LoaderProps = {
  type: ViewTypes;
  id?: string; // only used in share
};

export const ViewerLoader = ({ type, id }: LoaderProps) => {
  switch (type) {
    case ViewTypes.Landing:
      // TODO: figure out what this should be
      return <div></div>;
    case ViewTypes.Upload:
      // TODO: show upload tsx (dropzone)
      return <div></div>;
    case ViewTypes.Web:
      return <FromState redirect="/simulator" />;
    case ViewTypes.Local:
      return <FromUrl url='http://127.0.0.1:8381/data' redirect="/viewer" />;
    case ViewTypes.Share:
      // TODO: process url function + more request props for supporting more endpoints (hastebin)
      return <FromUrl url={processUrl(id)} redirect="/viewer" id={id} />;
  }
};

function processUrl(id?: string): string {
  if (id == null) {
    throw "share is missing id (should never happen)";
  }

  if (uuidValidate(id)) {
    return "/api/view/" + id;
  }
  const type = id.substring(0, id.indexOf("-"));
  id = id.substring(id.indexOf("-") + 1);
  if (type == "hb") {
    return "/hastebin/get/" + id;
  }
  return "";
}

function Base64ToJson(base64: string) {
  const bytes = Uint8Array.from(window.atob(base64), (v) => v.charCodeAt(0));
  return JSON.parse(Pako.inflate(bytes, { to: 'string' }));
}

const FromUrl = ({ url, redirect, id }: { url: string, redirect: string, id?: string }) => {
  const [data, setData] = useState<SimResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<ResultSource>(ResultSource.Loaded);

  const request = useCallback(() => {
    setError(null);
    axios.get(url, { timeout: 5000 }).then((resp) => {
      const out = Base64ToJson(resp.data.data);
      setData(out);
      console.log(out);
    }).catch((e) => {
      setError(e.message);
    });
  }, [url]);
  useEffect(() => request(), [request]);

  const updateResult = useRef(throttle((res: SimResults | null) => {
    setData(res);
    setSrc(ResultSource.Generated);
  }, VIEWER_THROTTLE, { leading: true, trailing: true }));

  return (
    <>
      <Viewer
          data={data}
          error={error}
          src={src}
          redirect={redirect}
          retry={request} />
      <UpgradeDialog
          data={data}
          redirect={redirect}
          setResult={updateResult.current}
          setError={setError}
          id={id} />
    </>
  );
};

// TODO: rather than using viewer state, have FromState call RunSim using sim state?
//  - determine if this is the right behavior we want. If I load the /viewer/web, should it:
//    * alert saying "no sim loaded" and confirm button redirects to /simulator (current)
//    * start running sim stored in local store, alert if not valid (proposed)
//  - This would also consolidate run logic into one place (here)
const FromState = ({ redirect }: { redirect: string }) => {
  const dispatch = useAppDispatch();
  const { data, error } = useAppSelector((state: RootState) => {
    return {
      data: state.viewer_new.data,
      error: state.viewer_new.error,
    };
  });

  const setResult = (result: SimResults | null) => {
    if (result == null) {
      return;
    }
    dispatch(viewerActions.setResult({ data: result }));
  };
  const updateResult = useRef(
      throttle(setResult, VIEWER_THROTTLE, { leading: true, trailing: true }));

  const setError = (error: string | null) => {
    if (error == null) {
      return;
    }
    dispatch(viewerActions.setError({ error: error }));
  };

  return (
    <>
      <Viewer
          data={data}
          src={ResultSource.Generated}
          error={error}
          redirect={redirect} />
      <UpgradeDialog
          data={data}
          redirect={redirect}
          setResult={updateResult.current}
          setError={setError} />
    </>
  );
};