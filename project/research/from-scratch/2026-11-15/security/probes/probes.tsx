// Negative probes: one mistake per line, each tagged. `npm`-free: run with ./probe.sh.
// The expected outcome is a tsc error on every line marked ERR and none on a line marked OK.
import { bind, css, fire, json, poll, search, swap } from "sealed";
import { ids, projects } from "../screens/projects.routes";

declare const user: { name: string; website: string; color: string; bio: string; payload: { a: number } };
const f = bind(projects.create, {});

export const p01 = <a href={projects.rows()}>x</a>;                       // ERR fragment route as a link
export const p02 = <button hx-get="/projects">x</button>;                // ERR raw hx-* attribute
export const p03 = <button hx-trgger="click">x</button>;                 // ERR misspelled raw hx-* attribute
export const p04 = <button onclick="go()">x</button>;                    // ERR inline handler (HTML spelling)
export const p05 = <button onClick={() => {}}>x</button>;                // ERR inline handler (React spelling)
export const p06 = <div style="color: red">x</div>;                      // ERR style string
export const p07 = <div style={`color: ${user.color}`}>x</div>;          // ERR style string from data
export const p08 = <script>alert(1)</script>;                            // ERR script text
export const p09 = <script>{user.bio}</script>;                          // ERR script string from data
export const p10 = <div dangerouslySetInnerHTML={{ __html: user.bio }} />; // ERR raw HTML prop
export const p11 = <input {...f.input("nmae")} />;                       // ERR field typo
export const p12 = projects.detail({ id: "3" });                         // ERR param type
export const p13 = projects.detail();                                    // ERR missing param
export const p14 = projects.list({ page: 2 });                           // ERR undeclared query key
export const p15 = <input hx={search(projects.list())} />;               // ERR page route to a fragment verb
export const p16 = <button commandfor="confirm-delete">x</button>;       // ERR id as a string where a target is meant
export const p17 = <img src="/a.png" />;                                 // ERR img without alt
export const p18 = <p>{user.payload}</p>;                                // ERR object as a child
export const p19 = <script src={user.website} />;                        // ERR script src from data
export const p20 = <style>{`.x{color:${user.color}}`}</style>;           // ERR style text
export const p21 = <span hx={poll(projects.detail({ id: 1 }))}>x</span>; // ERR page route to poll
export const p22 = <textarea><b>x</b></textarea>;                        // ERR markup inside textarea
export const p23 = <input maxLength={3} />;                              // ERR React casing
export const p24 = <button hx="/projects">x</button>;                    // ERR hx string
export const p25 = <button hx={fire(projects.rows())}>x</button>;        // ERR fragment route to fire
export const p26 = <a href={projects.remove({ id: 1 })}>x</a>;           // ERR delete route as a link
export const p27 = <button hx={fire(projects.remove({ id: 1 }), { vals: "js:alert(1)" })}>x</button>; // ERR vals string
export const p28 = <dvi>x</dvi>;                                         // ERR unknown element
export const p29 = <div data-hx-get="/x">x</div>;                        // OK? (runtime refuses)

export const ok1 = <a href={user.website}>{user.name}</a>;               // OK string URL: sanitised at the sink
export const ok2 = <div className="p-4" style={{ color: user.color, width: "40%" }}>x</div>; // OK
export const ok3 = <label htmlFor="x">x</label>;                         // OK
export const ok4 = <script>{json(user.payload)}</script>;                // OK
export const ok5 = <style>{css`.x{color: ${user.color}}`}</style>;       // OK
export const ok6 = <ul>{[1, 2].map((n) => <li key={n}>{n}</li>)}</ul>;   // OK key accepted and ignored
export const ok7 = <button hx={swap(projects.rows({ q: user.name }))}>x</button>; // OK
export const ok8 = <div data-user-id={3} aria-hidden>x</div>;            // OK
