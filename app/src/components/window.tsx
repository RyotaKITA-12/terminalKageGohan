import {
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  MouseEventHandler,
} from "react";
import { windowContext } from "@/context/window";
import { Window } from "@/@types/window";
import Styles from "./window.module.scss";

// ウィンドウのプロパティ
type RetroWindowProps = {
  window: Window;
};

// ウィンドウのコンポーネント
const RetroWindow = (props: RetroWindowProps) => {
  // Context の設定
  const { data, setWindowContext } = useContext(windowContext);

  // ウィンドウの状態
  const [drugging, setDrugging] = useState(false);
  const [drugoffset, setDrugOffset] = useState({ x: 0, y: 0 });

  // ウィンドウに対する参照
  const innerWindow = useRef<HTMLDivElement>(null);

  // タイトルバーがドラッグされている時のイベント
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (innerWindow.current) {
        innerWindow.current.style.left = `${event.pageX + drugoffset.x}px`;
        innerWindow.current.style.top = `${event.pageY + drugoffset.y}px`;
      }
    },
    [drugoffset]
  );

  // タイトルバーがクリックされた時のイベント
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
		if(!props.window.isMinimized && !props.window.isMaximized) {
			if (innerWindow.current && data) {
				const rect = innerWindow.current.getBoundingClientRect();
				if (setWindowContext)
					setWindowContext({ [props.window.id]: props.window, ...data });

				setDrugOffset({ x: rect.left - event.pageX, y: rect.top - event.pageY });
				setDrugging(true);
			}
		}
  };

  // タイトルバーのドラッグが解除された時のイベント
  const onMouseUp = () => {
		if(!props.window.isMinimized && !props.window.isMaximized) {
			if (innerWindow.current && drugging) {
				setDrugging(false);
				props.window.pos = {
					x: Number(innerWindow.current.style.left),
					y: Number(innerWindow.current.style.top),
				};
				if (setWindowContext) {
					setWindowContext({ [props.window.id]: props.window, ...data });
				}
			}
		}
  };

  // 最小化する時のイベント
  const onMinimize: MouseEventHandler<HTMLButtonElement> = () => {
    if(!props.window.isMinimized) {
        props.window.isMinimized = true;
        props.window.isMaximized = false;
    }
    else {
      props.window.isMinimized = false;
    }
		if (setWindowContext) {
			setWindowContext({ [props.window.id]: props.window, ...data });
		}
  }

  // 最大化する時のイベント
  const onMaximize: MouseEventHandler<HTMLButtonElement> = () => {
    if(!props.window.isMaximized) {
			props.window.isMaximized = true;
      props.window.isMinimized = false;
    }
    else {
      props.window.isMaximized = false;
    }
		if (setWindowContext) {
			setWindowContext({ [props.window.id]: props.window, ...data });
		}
  }

  // drugging が変更された時の副作用を設定
  useEffect(() => {
    if (drugging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
  }, [drugging]);

  // isMinimized・isMaximized が変更された時のイベント
  useEffect(() => {
    if (innerWindow.current) {
      if(props.window.isMinimized) {
        let closedCount = data ? Object.values(data).reduce((p,c,i,a) => p + (c.isMinimized ? 1 : 0), 0) : 0;
        innerWindow.current.style.width = `${props.window.size.width}px`;
        innerWindow.current.style.height = '27px';
        innerWindow.current.style.left = `calc(100vw - ${props.window.size.width}px)`;
        innerWindow.current.style.top = `calc(100vh - ${27 * closedCount}px)`;
      }
      else if(props.window.isMaximized) {
        innerWindow.current.style.width = '100vw';
        innerWindow.current.style.height = '100vh';
        innerWindow.current.style.left = `0px`;
        innerWindow.current.style.top = `0px`;
      }
      else {
        innerWindow.current.style.width = `${props.window.size.width}px`;
        innerWindow.current.style.height = `${props.window.size.height}px`;
        innerWindow.current.style.left = `${props.window.pos.x}px`;
        innerWindow.current.style.top = `${props.window.pos.y}px`;
      }
    }
  }, [props.window.isMinimized, props.window.isMaximized]);

  // ウィンドウを描画
  return (
    <div className={`window ${Styles.inner_window}`} ref={innerWindow}>
      <div className="title-bar" onMouseDown={onMouseDown}>
        <div className="title-bar-text" style={{userSelect:'none'}}>{props.window.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}/>
          <button aria-label="Maximize" onClick={onMaximize}/>
          <button aria-label="Close" />
        </div>
      </div>
      {!props.window.isMinimized && (
        <div className="window-body">{props.window.child}</div>
      )}
    </div>
  );
};

export { RetroWindow };