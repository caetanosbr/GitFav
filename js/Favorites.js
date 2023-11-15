import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
    this.noFav()
  }

  noFav() {
    if (localStorage.getItem("@github-favorites:") != "[]") {
      this.root.querySelector(".noFav").classList.add("hide")
      this.root.querySelector(".mainTbody").classList.remove("hide")
    } else {
      this.root.querySelector(".noFav").classList.remove("hide")
      this.root.querySelector(".mainTbody").classList.add("hide")
    }
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))

    this.noFav()
  }

  async add(username) {
    try {
      const userExists = this.entries.find(user => {
        return user.login === username
      })

      if (userExists) {
        throw new Error("Este usuário já foi registrado!")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => {
      return entry.login !== user.login
    })

    this.entries = filteredEntries
    this.update()
    this.save()
    this.noFav()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector(".mainTbody")
    this.update()

    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector("header button")
    addButton.addEventListener(`click`, () => {
      const inputValue = this.root.querySelector("header input").value

      this.add(inputValue)
    })
  }

  update() {
    this.removeAllTr()
    const input = this.root.querySelector("header input")
    input.focus()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector("img").src = `https://www.github.com/${user.login}.png`
      row.querySelector("img").alt = `Imagem de ${user.name}`
      row.querySelector(".user a").href = `https://www.github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name
      row.querySelector("span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove button").addEventListener(`click`, () => {
        const isOk = confirm(`Tem certeza de que deseja excluir este usuário?`)

        if (isOk == true) {
          this.delete(user)
        }
      })

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr")
    tr.innerHTML = `
        <td class="user">
            <div class="github-user">
                <img src="https://www.github.com/caetanosbr.png" alt="thiago caetano' github profile picture">
                <a href="https://www.github.com/caetanosbr" target="_blank">
                    <p>Thiago Caetano</p>
                    <span>/caetanosbr</span>
                </a>
            </div>
        </td>
        <td class="repositories">
            153
        </td>
        <td class="followers">
            1705
        </td>
        <td class="remove">
            <button>Remove</button>
        </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach(tr => {
      tr.remove()
    })
  }
}
