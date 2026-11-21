import React from "react"
import { createRoot } from "react-dom/client"
import "./style.css"

const initial = [
    {
    id: "a",
    text: "Сегодня было замечательное предложение пойти поужинать этим вечером. Главное, чтобы погода была преимущественно теплой",
    comments: ["Первый комментарий", "Второй комментарий"],
    open: false,
  },
  {
    id: "c",
    text: "Сегодня было замечательное предложение пойти поужинать этим вечером. Главное, чтобы погода была преимущественно теплой",
    comments: ["Первый комментарий", "Второй комментарий"],
    open: true,
  },
  
]
let state = initial,
  listeners = []
const actions = {
  add: (text) => ({
    type: "posts/add",
    payload: {
      id: Date.now(),
      text,
    },
  }),
  remove: (id) => ({
    type: "posts/remove",
    payload: id,
  }),
  edit: (payload) => ({
    type: "posts/edit",
    payload,
  }),
  toggle: (id) => ({
    type: "posts/toggle",
    payload: id,
  }),
  comment: (payload) => ({
    type: "posts/comment",
    payload,
  }),
  delComment: (payload) => ({
    type: "posts/delComment",
    payload,
  }),
}

function reducer(s = initial, a) {
  switch (a.type) {
    case "posts/add":
      return [a.payload, ...s]
    case "posts/remove":
      return s.filter((p) => p.id !== a.payload)
    case "posts/edit":
      return s.map((p) =>
        p.id === a.payload.id
          ? {
              ...p,
              text: a.payload.text,
            }
          : p
      )
    case "posts/toggle":
      return s.map((p) =>
        p.id === a.payload
          ? {
              ...p,
              open: !p.open,
            }
          : p
      )
    case "posts/comment":
      return s.map((p) =>
        p.id === a.payload.id
          ? {
              ...p,
              comments: [...(p.comments || []), a.payload.text],
            }
          : p
      )
    case "posts/delComment":
      return s.map((p) =>
        p.id === a.payload.id
          ? {
              ...p,
              comments: (p.comments || []).filter((_, i) => i !== a.payload.i),
            }
          : p
      )
    default:
      return s
  }
}

const store = {
  getState: () => state,
  dispatch: (a) => {
    state = reducer(state, a)
    listeners.forEach((f) => f())
    return a
  },
  subscribe: (f) => (
    listeners.push(f), () => (listeners = listeners.filter((x) => x !== f))
  ),
}

function App() {
  const [posts, setPosts] = React.useState(store.getState()),
    [text, set] = React.useState(""),
    [modalOpen, setModalOpen] = React.useState(false),
    [editId, setEditId] = React.useState(null),
    [editText, setEditText] = React.useState("")

  React.useEffect(
    () => store.subscribe(() => setPosts([...store.getState()])),
    []
  )

  return (
    <main>
      <form
        className="top"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) store.dispatch(actions.add(text))
          set("")
        }}
      >
        <input
          placeholder="Новый пост ..."
          value={text}
          onChange={(e) => set(e.target.value)}
        />
        <button>Добавить</button>
      </form>{" "}
      {posts.map((p) => (
        <article key={p.id}>
          <div className="post"> {p.text}</div>
          <hr />
          <div className="actions">
            {" "}
            <button onClick={() => store.dispatch(actions.toggle(p.id))}>
              {" "}
              {p.open ? "Спрятать" : "Комментарии"}{" "}
            </button>
            <span> Количество комментариев - {(p.comments || []).length} </span>{" "}
            {!p.open && (
              <>
                {" "}
                <button
                  onClick={() => {
                    setEditId(p.id)
                    setEditText(p.text)
                    setModalOpen(true)
                  }}
                >
                  {" "}
                  Изменить{" "}
                </button>{" "}
                <button
                  className="danger"
                  onClick={() => store.dispatch(actions.remove(p.id))}
                >
                  {" "}
                  Удалить{" "}
                </button>{" "}
              </>
            )}{" "}
          </div>{" "}
          {p.open && (
            <>
              <form
                className="commentform"
                onSubmit={(e) => {
                  e.preventDefault()
                  let v = e.target.elements.comment.value.trim()
                  if (v)
                    store.dispatch(
                      actions.comment({
                        id: p.id,
                        text: v,
                      })
                    )
                  e.target.reset()
                }}
              >
                <input name="comment" placeholder="Новый комментарий ..." />
                <button> Добавить </button>
              </form>{" "}
              {(p.comments || []).map((c, i) => (
                <div className="comment" key={i}>
                  <span> {c}</span>
                  <button
                    className="danger"
                    onClick={() =>
                      store.dispatch(
                        actions.delComment({
                          id: p.id,
                          i,
                        })
                      )
                    }
                  >
                    {" "}
                    Удалить{" "}
                  </button>
                </div>
              ))}
            </>
          )}
        </article>
      ))}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редактирование поста</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  if (editId && editText.trim()) {
                    store.dispatch(actions.edit({ id: editId, text: editText }))
                  }
                  setModalOpen(false)
                }}
              >
                Подтвердить
              </button>
              <button className="danger" onClick={() => setModalOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

createRoot(document.getElementById("root")).render(<App />)
